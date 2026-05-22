import ProductCard from "./ProductCard";

function DisplayProd({ products }) {
  return (
    <div className="product-grid">
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
}

export default DisplayProd;