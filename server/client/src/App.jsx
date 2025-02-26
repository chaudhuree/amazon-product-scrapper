"use client";

import { useState } from "react";
import axios from "axios";
import { Search, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ProductImporter() {
  const [url, setUrl] = useState("");

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    try {
      setError("");
      setProduct(null);
      setIsLoading(true);

      const response = await axios.post(
        `${API_URL}/scrape-product`,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setProduct(response.data);
    } catch (err) {
      console.error("Error from backend: ", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(
          "Failed to import product. Make sure the URL is correct and the backend is running."
        );
      }
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Replaced background with gray-50 */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Product Importer
          </h1>
          <p className="text-gray-500">
            {/* Replaced text-muted-foreground with gray-500 */}
            Paste a product URL below to import its details
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/product"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
              setProduct(null);
            }}
            className="flex-1 border rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            //Added basic styling
          />
          <button
            onClick={handleImport}
            disabled={isLoading || !url}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              isLoading || !url ? "opacity-50 cursor-not-allowed" : ""
            }`} //Styled button and added disabled styles
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                Importing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4 inline-block" />
                Import
              </>
            )}
          </button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            {/* Styled error message */}
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {product && (
          <div className="overflow-hidden rounded-md shadow-md">
            {/* Styled card */}
            {product.image && (
              <div className="relative h-[300px] border-b">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              </div>
            )}
            <div className="p-4">
              {/* Styled header */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <span>{product.name || "Product Name Not Found"}</span>
                {product.price && (
                  <span className="bg-gray-200 text-gray-700 text-lg font-medium py-1 px-3 rounded-full">
                    {/* Styled badge */}
                    {product.price.split("$")[1]}$
                  </span>
                )}
              </div>
              {product.breadcrumbs && product.breadcrumbs.length > 0 && (
                <div className="flex flex-wrap gap-1 text-sm text-gray-500">
                  {/* Styled breadcrumbs */}
                  {product.breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                      {crumb}
                      {index < product.breadcrumbs.length - 1 && " →"}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 space-y-6">
              {/* Styled card content */}
              {(product.rating || product.ratingCount) && (
                <div className="flex gap-4">
                  {product.rating && (
                    <span className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-full">
                      {/* Styled badge */}
                      Rating: {product.rating}
                    </span>
                  )}
                  {product.ratingCount && (
                    <span className="bg-gray-100 border border-gray-300 text-gray-700 py-1 px-3 rounded-full">
                      {/* Styled badge */}
                      Reviews: {product.ratingCount}
                    </span>
                  )}
                </div>
              )}

              {product.description && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-gray-500">{product.description}</p>
                  {/* Styled description */}
                </div>
              )}

              {product.bullets && product.bullets.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Key Features</h3>
                  <ul className="grid gap-2 pl-4 text-gray-500 list-disc">
                    {/* Styled list */}
                    {product.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.productDetails &&
                Object.keys(product.productDetails).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Product Details</h3>
                    <div className="h-[200px] rounded-md border p-4 overflow-auto">
                      {/* Styled scroll area */}
                      <div className="space-y-2">
                        {Object.entries(product.productDetails).map(
                          ([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="font-medium min-w-[120px]">
                                {key}:
                              </span>
                              <span className="text-gray-500">{value}</span>
                              {/* Styled product detail */}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
