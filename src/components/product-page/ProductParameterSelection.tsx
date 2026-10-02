"use client";

import React, { useState, useEffect } from "react";
import {
  Product,
  ProductParameterWithValues,
} from "@/types/product.types";
import { FaAsterisk } from "react-icons/fa";

interface ProductParameterSelectionProps {
  product: Product;
  onParameterChange: (
    selections: { [parameterId: number]: string[] }
  ) => void;
  onValidationChange: (isValid: boolean) => void;
}

interface ProductVariant {
  id: number;
  product_id: string | number;
  price: number;
  parameter_selections: {
    [parameterId: string]: string[];
  };
}

const ProductParameterSelection: React.FC<
  ProductParameterSelectionProps
> = ({
  product,
  onParameterChange,
  onValidationChange,
}) => {
  const [parameters, setParameters] = useState<
    ProductParameterWithValues[]
  >([]);

  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [selectedValues, setSelectedValues] = useState<{
    [parameterId: number]: string[];
  }>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchParameters();
  }, [product.id]);

  useEffect(() => {
    validateSelections();
  }, [selectedValues, parameters]);

  /**
   * Fetch parameters and real product variants
   */
  const fetchParameters = async () => {
    if (!product.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch parameters
      const parametersResponse = await fetch(
        `/api/products/${product.id}/parameters`
      );

      if (!parametersResponse.ok) {
        throw new Error("Failed to fetch parameters");
      }

      const parametersData =
        await parametersResponse.json();

      setParameters(parametersData);

      // Fetch real variants
      const variantsResponse = await fetch(
        `/api/products/${product.id}/variant`
      );

      if (!variantsResponse.ok) {
        throw new Error("Failed to fetch product variants");
      }

      const variantsData =
        await variantsResponse.json();

      const normalizedVariants: ProductVariant[] =
        Array.isArray(variantsData)
          ? variantsData.map((variant) => {
              let selections =
                variant.parameter_selections || {};

              // Handle JSON returned as a string
              if (typeof selections === "string") {
                try {
                  selections = JSON.parse(selections);
                } catch {
                  selections = {};
                }
              }

              return {
                id: Number(variant.id),
                product_id: variant.product_id,
                price: Number(variant.price),
                parameter_selections: selections,
              };
            })
          : [];

      setVariants(normalizedVariants);

      console.log(
        "Product variants loaded:",
        normalizedVariants
      );
    } catch (err) {
      console.error(
        "Error fetching product configuration:",
        err
      );

      setError(
        "Failed to load product parameters"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate required parameters
   */
  const validateSelections = () => {
    const requiredParameters =
      parameters.filter(
        (param) => param.is_required
      );

    const isValid =
      requiredParameters.every((param) => {
        const selection =
          selectedValues[param.id];

        return (
          selection &&
          selection.length > 0
        );
      });

    onValidationChange(isValid);
    onParameterChange(selectedValues);
  };

  /**
   * Check whether a specific parameter value
   * exists in at least one real product variant
   * compatible with the current selections.
   */
  const isValueAvailable = (
    parameterId: number,
    valueId: string
  ) => {
    // If variants haven't loaded yet,
    // don't disable anything.
    if (variants.length === 0) {
      return true;
    }

    return variants.some((variant) => {
      const selections =
        variant.parameter_selections || {};

      // Does this variant contain the value
      // we're checking?
      const variantValues =
        selections[String(parameterId)] || [];

      if (
        !variantValues.includes(valueId)
      ) {
        return false;
      }

      /**
       * Check all other currently selected
       * parameters against this variant.
       */
      return Object.entries(
        selectedValues
      ).every(
        ([
          selectedParameterId,
          selectedParameterValues,
        ]) => {
          const selectedId =
            Number(selectedParameterId);

          // Ignore the parameter currently
          // being checked.
          if (
            selectedId === parameterId
          ) {
            return true;
          }

          // Nothing selected for this parameter.
          if (
            !selectedParameterValues ||
            selectedParameterValues.length === 0
          ) {
            return true;
          }

          const variantSelectedValues =
            selections[
              selectedParameterId
            ] || [];

          // Every selected value must exist
          // in the variant.
          return selectedParameterValues.every(
            (selectedValue) =>
              variantSelectedValues.includes(
                selectedValue
              )
          );
        }
      );
    });
  };

  /**
   * Handle dropdown / radio / text / number changes
   */
  const handleSelectChange = (
    parameterId: number,
    value: string
  ) => {
    setSelectedValues((prev) => {
      const next = {
        ...prev,
        [parameterId]: value
          ? [value]
          : [],
      };

      // Clear parameters that directly depend
      // on this parameter.
      parameters.forEach((parameter) => {
        if (
          parameter.depends_on_parameter ===
          parameterId
        ) {
          delete next[parameter.id];
        }
      });

      return next;
    });
  };

  /**
   * Handle checkbox / multiselect changes
   */
  const handleCheckboxChange = (
    parameterId: number,
    value: string,
    checked: boolean
  ) => {
    // Don't allow unavailable values
    if (
      checked &&
      !isValueAvailable(
        parameterId,
        value
      )
    ) {
      return;
    }

    setSelectedValues((prev) => {
      const currentValues =
        prev[parameterId] || [];

      if (checked) {
        return {
          ...prev,
          [parameterId]: [
            ...currentValues,
            value,
          ],
        };
      }

      return {
        ...prev,
        [parameterId]:
          currentValues.filter(
            (v) => v !== value
          ),
      };
    });
  };

  /**
   * Existing parameter dependency logic
   */
  const isParameterVisible = (
    parameter: ProductParameterWithValues
  ) => {
    // No dependency = always visible
    if (
      !parameter.depends_on_parameter
    ) {
      return true;
    }

    const parentSelection =
      selectedValues[
        parameter.depends_on_parameter
      ] || [];

    // Parent hasn't been selected yet
    if (
      parentSelection.length === 0
    ) {
      return false;
    }

    // Show parameter only when selected
    // parent value matches.
    return parentSelection.includes(
      parameter.depends_on_value || ""
    );
  };

  /**
   * Render parameter input
   */
  const renderParameterInput = (
    parameter: ProductParameterWithValues
  ) => {
    const currentSelection =
      selectedValues[parameter.id] || [];

    const isRequired =
      parameter.is_required;

    const hasError =
      isRequired &&
      currentSelection.length === 0;

    switch (parameter.parameter_type) {
      /**
       * DROPDOWN
       */
      case "dropdown":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <select
              value={
                currentSelection[0] || ""
              }
              onChange={(e) =>
                handleSelectChange(
                  parameter.id,
                  e.target.value
                )
              }
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <option value="">
                Select{" "}
                {parameter.parameter_name}
              </option>

              {parameter.values.map(
                (value) => {
                  const valueId =
                    value.id.toString();

                  const available =
                    isValueAvailable(
                      parameter.id,
                      valueId
                    );

                  return (
                    <option
                      key={value.id}
                      value={valueId}
                      disabled={!available}
                    >
                      {value.value_name}
                      {!available
                        ? " — Not available"
                        : ""}
                    </option>
                  );
                }
              )}
            </select>

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                {parameter.parameter_name}{" "}
                is required
              </p>
            )}
          </div>
        );

      /**
       * CHECKBOX / MULTISELECT
       */
      case "checkbox":
      case "multiselect":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <div
              className={`space-y-2 p-3 border rounded-lg ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              {parameter.values.map(
                (value) => {
                  const valueId =
                    value.id.toString();

                  const available =
                    isValueAvailable(
                      parameter.id,
                      valueId
                    );

                  return (
                    <label
                      key={value.id}
                      className={`flex items-center space-x-2 ${
                        available
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentSelection.includes(
                          valueId
                        )}
                        disabled={!available}
                        onChange={(e) =>
                          handleCheckboxChange(
                            parameter.id,
                            valueId,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />

                      <span className="text-sm text-gray-700">
                        {value.value_name}
                      </span>
                    </label>
                  );
                }
              )}
            </div>

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                Please select at least one{" "}
                {parameter.parameter_name}
              </p>
            )}
          </div>
        );

      /**
       * RADIO
       */
      case "radio":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <div
              className={`space-y-2 p-3 border rounded-lg ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              {parameter.values.map(
                (value) => {
                  const valueId =
                    value.id.toString();

                  const available =
                    isValueAvailable(
                      parameter.id,
                      valueId
                    );

                  return (
                    <label
                      key={value.id}
                      className={`flex items-center space-x-2 ${
                        available
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`parameter-${parameter.id}`}
                        value={valueId}
                        checked={currentSelection.includes(
                          valueId
                        )}
                        disabled={!available}
                        onChange={(e) =>
                          handleSelectChange(
                            parameter.id,
                            e.target.value
                          )
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />

                      <span className="text-sm text-gray-700">
                        {value.value_name}
                      </span>
                    </label>
                  );
                }
              )}
            </div>

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                Please select one{" "}
                {parameter.parameter_name}
              </p>
            )}
          </div>
        );

      /**
       * TEXT
       */
      case "text":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <input
              type="text"
              value={
                currentSelection[0] || ""
              }
              onChange={(e) =>
                handleSelectChange(
                  parameter.id,
                  e.target.value
                )
              }
              placeholder={`Enter ${parameter.parameter_name}`}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            />

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                {parameter.parameter_name}{" "}
                is required
              </p>
            )}
          </div>
        );

      /**
       * NUMBER
       */
      case "number":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <input
              type="number"
              value={
                currentSelection[0] || ""
              }
              onChange={(e) =>
                handleSelectChange(
                  parameter.id,
                  e.target.value
                )
              }
              placeholder={`Enter ${parameter.parameter_name}`}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            />

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                {parameter.parameter_name}{" "}
                is required
              </p>
            )}
          </div>
        );

      /**
       * TEXTAREA
       */
      case "textarea":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {parameter.parameter_name}

              {isRequired && (
                <FaAsterisk className="inline ml-1 w-2 h-2 text-red-500" />
              )}
            </label>

            <textarea
              value={
                currentSelection[0] || ""
              }
              onChange={(e) =>
                handleSelectChange(
                  parameter.id,
                  e.target.value
                )
              }
              placeholder={`Enter ${parameter.parameter_name}`}
              rows={3}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                hasError
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            />

            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                {parameter.parameter_name}{" "}
                is required
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Configuration
        </h3>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error
        </h3>

        <p className="text-red-700">
          {error}
        </p>
      </div>
    );
  }

  /**
   * No parameters
   */
  if (parameters.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Product Configuration
        </h3>

        <p className="text-gray-600">
          No additional configuration
          options available for this
          product.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔧 Configure Your Product
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Customize this product by
        selecting the specifications
        that best meet your
        requirements.
      </p>

      <div className="space-y-6">
        {parameters
          .filter(isParameterVisible)
          .map((parameter) => (
            <div key={parameter.id}>
              {renderParameterInput(
                parameter
              )}
            </div>
          ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-900">
            ℹ️ Note:
          </span>

          <span className="text-sm text-blue-800">
            Required fields are marked
            with{" "}
            <FaAsterisk className="inline w-2 h-2 text-red-500" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductParameterSelection;