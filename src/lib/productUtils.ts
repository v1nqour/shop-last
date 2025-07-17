import { neon } from '@neondatabase/serverless';
import { Product } from '@/types/product.types';
import { getProductFamily, getProductParameterSelections } from './familyUtils';

export async function getProducts(): Promise<Product[]> {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No database URL found');
    throw new Error('No database URL found');
  }

  const sql = neon(connectionString);
  try {
    const rows: any[] = await sql`
      SELECT p.*, pf.name as family_name, pf.description as family_description
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      ORDER BY p.id
    `;
    
    const products = await Promise.all(
      rows
        .filter(row => row.id != null) // Ensure id exists
        .map(async row => {
          let specifications: { label: string; value: string }[] = row.specifications || [];
          if (row.specifications && !Array.isArray(specifications)) {
            console.warn(`Invalid specifications format for product ${row.id}:`, row.specifications);
            specifications = [];
          }

          // Get family information
          const family = row.family_id ? {
            id: row.family_id,
            name: row.family_name || '',
            description: row.family_description || '',
          } : undefined;

          // Get parameter selections
          const parameter_selections = await getProductParameterSelections(String(row.id));

          return {
            id: String(row.id), // Force string conversion
            title: row.title || '',
            srcUrl: row.src_url || '',
            name: row.name || '',
            gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
            price: parseFloat(row.price) || 0,
            category: row.category || '',
            rating: Number(row.rating) || 0,
            specifications: specifications.filter(spec => spec?.label && spec?.value),
            description: row.description || '',
            disablePrice: Boolean(row.disable_price),
            family_id: row.family_id || undefined,
            family,
            parameter_selections,
          };
        })
    );
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set, returning empty product list for category:', category);
    return [];
  }

  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows: any[] = await sql`
      SELECT p.*, pf.name as family_name, pf.description as family_description
      FROM products p
      LEFT JOIN product_families pf ON p.family_id = pf.id
      WHERE p.category = ${category}
      ORDER BY p.id
    `;
    
    const products = await Promise.all(
      rows.map(async row => {
        let specifications: { label: string; value: string }[] = row.specifications || [];
        if (row.specifications && !Array.isArray(specifications)) {
          specifications = [];
        }

        // Get family information
        const family = row.family_id ? {
          id: row.family_id,
          name: row.family_name || '',
          description: row.family_description || '',
        } : undefined;

        // Get parameter selections
        const parameter_selections = await getProductParameterSelections(String(row.id));

        return {
          id: String(row.id), // string
          title: row.title,
          srcUrl: row.src_url || '',
          name: row.name || '',
          gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
          price: parseFloat(row.price) || 0,
          category: row.category,
          rating: Number(row.rating) || 0,
          specifications: specifications.filter(spec => spec?.label && spec?.value),
          description: row.description || '',
          disablePrice: Boolean(row.disable_price),
          family_id: row.family_id || undefined,
          family,
          parameter_selections,
        };
      })
    );
    
    return products;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'family' | 'parameter_selections'>): Promise<Product> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows: any[] = await sql`
      INSERT INTO products (
        title, src_url, name, gallery, price, category, rating, specifications, description, disable_price, family_id
      )
      VALUES (
        ${product.title},
        ${product.srcUrl},
        ${product.name || ''},
        ${product.gallery || null},
        ${product.price},
        ${product.category},
        ${product.rating || 0},
        ${product.specifications ? JSON.stringify(product.specifications) : null},
        ${product.description || ''},
        ${product.disablePrice || false},
        ${product.family_id || null}
      )
      RETURNING *;
    `;
    const row = rows[0];
    
    let specifications: { label: string; value: string }[] = row.specifications || [];
    if (row.specifications && !Array.isArray(specifications)) {
      console.warn(`Invalid specifications format for added product ${row.id}:`, row.specifications);
      specifications = [];
    }

    // Get family information
    const family = row.family_id ? await getProductFamily(row.family_id) : undefined;

    return {
      id: String(row.id), // string
      title: row.title,
      srcUrl: row.src_url || '',
      name: row.name || '',
      gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
      price: parseFloat(row.price) || 0,
      category: row.category,
      rating: Number(row.rating) || 0,
      specifications: specifications.filter(spec => spec?.label && spec?.value),
      description: row.description || '',
      disablePrice: Boolean(row.disable_price),
      family_id: row.family_id || undefined,
      family: family || undefined,
      parameter_selections: [],
    };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'family' | 'parameter_selections'>>): Promise<Product> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows: any[] = await sql`
      UPDATE products
      SET
        title = COALESCE(${product.title}, title),
        src_url = COALESCE(${product.srcUrl}, src_url),
        name = COALESCE(${product.name}, name),
        gallery = COALESCE(${product.gallery || null}, gallery),
        price = COALESCE(${product.price}, price),
        category = COALESCE(${product.category}, category),
        rating = COALESCE(${product.rating}, rating),
        specifications = COALESCE(${product.specifications ? JSON.stringify(product.specifications) : null}, specifications),
        description = COALESCE(${product.description}, description),
        disable_price = COALESCE(${product.disablePrice}, disable_price),
        family_id = COALESCE(${product.family_id}, family_id)
      WHERE id = ${id}
      RETURNING *;
    `;
    if (rows.length === 0) {
      throw new Error(`Product with id ${id} not found`);
    }
    const row = rows[0];
    
    let specifications: { label: string; value: string }[] = row.specifications || [];
    if (row.specifications && !Array.isArray(specifications)) {
      console.warn(`Invalid specifications format for updated product ${row.id}:`, row.specifications);
      specifications = [];
    }

    // Get family information
    const family = row.family_id ? await getProductFamily(row.family_id) : undefined;
    
    // Get parameter selections
    const parameter_selections = await getProductParameterSelections(String(row.id));

    return {
      id: String(row.id), // string
      title: row.title,
      srcUrl: row.src_url || '',
      name: row.name || '',
      gallery: Array.isArray(row.gallery) ? row.gallery.filter(Boolean) : [],
      price: parseFloat(row.price) || 0,
      category: row.category,
      rating: Number(row.rating) || 0,
      specifications: specifications.filter(spec => spec?.label && spec?.value),
      description: row.description || '',
      disablePrice: Boolean(row.disable_price),
      family_id: row.family_id || undefined,
      family: family || undefined,
      parameter_selections,
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  const sql = neon(process.env.DATABASE_URL);
  try {
    const result: any[] = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}