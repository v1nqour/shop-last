import { NextResponse } from "next/server";
import { getProducts, getProductsByCategory, addProduct, updateProduct, deleteProduct } from "@/lib/productUtils";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const products = category ? await getProductsByCategory(category) : await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    if (!newProduct.title || !newProduct.srcUrl || !newProduct.name || !newProduct.category || !newProduct.specifications || !newProduct.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const savedProduct = await addProduct(newProduct);
    return NextResponse.json({ message: "Product added successfully", product: savedProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...productData } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    const updatedProduct = await updateProduct(id, productData);
    return NextResponse.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    await deleteProduct(id);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}