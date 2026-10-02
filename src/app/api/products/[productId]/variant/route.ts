import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const variants = await sql`
      SELECT
        id,
        product_id,
        price,
        parameter_selections
      FROM product_variants
      WHERE product_id = ${productId}
      ORDER BY id
    `;

    return NextResponse.json(
      variants.map((variant) => ({
        id: variant.id,
        product_id: variant.product_id,
        price: Number(variant.price),
        parameter_selections: variant.parameter_selections || {},
      }))
    );
  } catch (error) {
    console.error("Error fetching product variants:", error);

    return NextResponse.json(
      { error: "Failed to fetch product variants" },
      { status: 500 }
    );
  }
}

// POST: Find an exact matching variant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const { selectedParameters } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!selectedParameters || typeof selectedParameters !== "object") {
      return NextResponse.json(
        { error: "Selected parameters are required" },
        { status: 400 }
      );
    }

    const variants = await sql`
      SELECT
        id,
        product_id,
        price,
        parameter_selections
      FROM product_variants
      WHERE product_id = ${productId}
    `;

    const matchingVariant = variants.find((variant) => {
      const variantSelections = variant.parameter_selections || {};

      const selectedKeys = Object.keys(selectedParameters);
      const variantKeys = Object.keys(variantSelections);

      // The selected parameters must contain exactly
      // the same number of parameters as the variant.
      if (selectedKeys.length !== variantKeys.length) {
        return false;
      }

      return selectedKeys.every((parameterId) => {
        const selectedValues = selectedParameters[parameterId] || [];
        const variantValues = variantSelections[parameterId] || [];

        // Same number of selected values
        if (selectedValues.length !== variantValues.length) {
          return false;
        }

        // Every selected value must exist in the variant
        return selectedValues.every((value: string) =>
          variantValues.includes(value)
        );
      });
    });

    if (!matchingVariant) {
      return NextResponse.json(
        {
          found: false,
          error: "No matching variant found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      found: true,
      variant: {
        id: matchingVariant.id,
        product_id: matchingVariant.product_id,
        price: Number(matchingVariant.price),
        parameter_selections: matchingVariant.parameter_selections,
      },
    });
  } catch (error) {
    console.error("Error finding product variant:", error);

    return NextResponse.json(
      { error: "Failed to find product variant" },
      { status: 500 }
    );
  }
}