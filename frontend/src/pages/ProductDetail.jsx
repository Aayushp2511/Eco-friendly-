import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Package, Truck, Shield, Leaf, CheckCircle, ArrowRightLeft, XCircle, Gauge, Lightbulb, Dot } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const product = data?.data;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    try {
      await addToCart(product._id, quantity);
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error('Failed to add product to cart');
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    toast.success('Added to wishlist!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Breadcrumb */}
          <nav className="flex px-6 py-4 text-sm text-gray-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>Shop</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate max-w-xs md:max-w-md">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={product.images?.[selectedImage]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block px-3 py-1 text-xs font-semibold text-teal bg-teal/10 rounded-full mb-3">
                  {product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.ratings?.average || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.ratings?.average || 0} ({product.ratings?.count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Eco Score */}
                {product.ecoScore > 0 && (
                  <div className="mb-6 p-4 bg-green/5 rounded-lg border border-green/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Eco Score</h3>
                      <span className="text-lg font-bold text-green">{product.ecoScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green to-teal h-3 rounded-full"
                        style={{ width: `${product.ecoScore}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      This product has a high environmental rating based on sustainability factors.
                    </p>
                  </div>
                )}

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <div className="flex items-center text-green-600">
                      <Package className="h-5 w-5 mr-2" />
                      <span className="font-medium">In Stock ({product.stock} available)</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <Package className="h-5 w-5 mr-2" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center mb-6">
                  <span className="mr-4 font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                    className="flex-1"
                    disabled={product.stock === 0}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist
                  </Button>
                </div>
              </div>

              {/* Product Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-start">
                  <Truck className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Free Shipping</h4>
                    <p className="text-sm text-gray-600">On orders over ₹500</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                    <p className="text-sm text-gray-600">100% secure payment</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Package className="h-6 w-6 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Easy Returns</h4>
                    <p className="text-sm text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t border-gray-200">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <div className="prose max-w-none text-gray-700">
                    <p>{product.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                  <dl className="space-y-3">
                    <div className="flex">
                      <dt className="w-32 font-medium text-gray-900">Category</dt>
                      <dd className="text-gray-700">{product.category}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-32 font-medium text-gray-900">Stock</dt>
                      <dd className="text-gray-700">{product.stock} units</dd>
                    </div>
                    {product.ecoScore > 0 && (
                      <div className="flex">
                        <dt className="w-32 font-medium text-gray-900">Eco Score</dt>
                        <dd className="text-gray-700">{product.ecoScore}/100</dd>
                      </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex">
                        <dt className="w-32 font-medium text-gray-900">Tags</dt>
                        <dd className="text-gray-700">
                          {product.tags.join(', ')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              {/* Environmental Impact Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Environmental Impact</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Environmental Benefits */}
                  <div className="bg-green/5 rounded-xl p-6 border border-green/10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Leaf className="h-5 w-5 text-green mr-2" />
                      Environmental Benefits
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          {getEnvironmentalBenefit(product.category, 'benefit')}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          Reduces carbon footprint by approximately {getCarbonFootprintReduction(product.ecoScore)}% compared to conventional alternatives
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          Made from {getSustainableMaterials(product.specifications)}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          {isBiodegradable(product.tags) ? 'Biodegradable and compostable' : 'Durable and long-lasting to reduce waste'}
                        </span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Comparison with Conventional Products */}
                  <div className="bg-blue/5 rounded-xl p-6 border border-blue/10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <ArrowRightLeft className="h-5 w-5 text-blue mr-2" />
                      Better Than Conventional Products
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <XCircle className="h-5 w-5 text-red mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          Unlike conventional {getConventionalAlternative(product.category)}, this product is designed for sustainability
                        </span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-5 w-5 text-red mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          No harmful chemicals or toxins that pollute the environment
                        </span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-5 w-5 text-red mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          {getWasteReductionInfo(product.category)}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <XCircle className="h-5 w-5 text-red mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">
                          Supports ethical manufacturing and fair trade practices
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Carbon Footprint Visualization */}
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Gauge className="h-5 w-5 text-primary mr-2" />
                    Estimated Carbon Footprint Savings
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Conventional Product</span>
                    <span className="text-sm text-gray-600">Eco-Friendly Alternative</span>
                  </div>
                  <div className="relative h-6 bg-gradient-to-r from-red-100 to-green-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-red-200 rounded-full"
                      style={{ width: '100%' }}
                    ></div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                      style={{ width: `${100 - getCarbonFootprintReduction(product.ecoScore)}%` }}
                    ></div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      This product reduces CO₂ emissions by approximately {getCarbonFootprintReduction(product.ecoScore)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      By choosing this eco-friendly product, you're helping to create a more sustainable future
                    </p>
                  </div>
                </div>
                
                {/* Eco Tips */}
                <div className="mt-8 bg-teal/5 rounded-xl p-6 border border-teal/10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 text-teal mr-2" />
                    Eco Tips
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Maximize the environmental benefits of your purchase:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <Dot className="h-5 w-5 text-teal mt-0.5 mr-2 flex-shrink-0" />
                      Use this product for its intended lifespan to maximize environmental benefits
                    </li>
                    <li className="flex items-start">
                      <Dot className="h-5 w-5 text-teal mt-0.5 mr-2 flex-shrink-0" />
                      Properly dispose of or recycle at the end of its life
                    </li>
                    <li className="flex items-start">
                      <Dot className="h-5 w-5 text-teal mt-0.5 mr-2 flex-shrink-0" />
                      Share with friends to spread awareness about sustainable choices
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for environmental information
function getEnvironmentalBenefit(category, type) {
  const benefits = {
    'Reusable Products': 'Eliminates single-use plastic waste',
    'Organic Foods': 'Reduces pesticide and chemical runoff into ecosystems',
    'Eco-Friendly Home': 'Improves indoor air quality and reduces toxic chemicals',
    'Sustainable Fashion': 'Reduces water consumption and chemical pollution',
    'Zero Waste': 'Minimizes landfill contributions and promotes circular economy',
    'Natural Beauty': 'Avoids harmful chemicals that damage aquatic ecosystems',
    'Green Tech': 'Utilizes renewable energy sources to reduce fossil fuel dependence',
    'Other': 'Provides sustainable alternatives to conventional products'
  };
  
  return benefits[category] || 'Reduces environmental impact compared to conventional alternatives';
}

function getCarbonFootprintReduction(ecoScore) {
  // Convert ecoScore (0-100) to estimated carbon footprint reduction percentage
  return Math.min(90, Math.max(30, ecoScore * 0.7)).toFixed(0);
}

function getSustainableMaterials(specifications) {
  if (!specifications) return 'sustainable materials';
  
  // Handle both Map-like objects and plain objects
  const material = specifications.get ? 
    specifications.get('Material') || specifications.get('material') :
    specifications['Material'] || specifications['material'];
    
  if (material) return material.toLowerCase();
  
  return 'eco-friendly materials';
}

function isBiodegradable(tags) {
  if (!tags) return false;
  const biodegradableTerms = ['biodegradable', 'compostable', 'natural', 'organic'];
  return tags.some(tag => biodegradableTerms.includes(tag.toLowerCase()));
}

function getConventionalAlternative(category) {
  const alternatives = {
    'Reusable Products': 'disposable plastic items',
    'Organic Foods': 'conventionally grown produce',
    'Eco-Friendly Home': 'chemical-based household products',
    'Sustainable Fashion': 'fast fashion items',
    'Zero Waste': 'single-use packaging',
    'Natural Beauty': 'chemical-laden cosmetics',
    'Green Tech': 'non-renewable energy devices',
    'Other': 'standard consumer goods'
  };
  
  return alternatives[category] || 'traditional products';
}

function getWasteReductionInfo(category) {
  const info = {
    'Reusable Products': 'Designed for hundreds of uses, eliminating single-use waste',
    'Organic Foods': 'Reduces food waste through sustainable farming practices',
    'Eco-Friendly Home': 'Concentrated formulas reduce packaging waste',
    'Sustainable Fashion': 'Timeless designs reduce textile waste from trends',
    'Zero Waste': 'Refillable systems eliminate disposable packaging',
    'Natural Beauty': 'Minimalist packaging reduces plastic waste',
    'Green Tech': 'Energy-efficient operation reduces electricity waste',
    'Other': 'Thoughtful design minimizes resource consumption'
  };
  
  return info[category] || 'Reduces waste through sustainable design and materials';
}

export default ProductDetail;