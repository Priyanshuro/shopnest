// main.mo — composition root for ShopNest backend
// Wires all stable state, mixin includes, extension components, and seeds dummy data.
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Stripe "mo:caffeineai-stripe/stripe";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "types/products-orders-auth";
import Common "types/common";
import ProductsOrdersAuthApi "mixins/products-orders-auth-api";

actor {
  // ── Authorization ────────────────────────────────────────────────────────
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Object storage (for product/shop images, if needed at runtime) ───────
  include MixinObjectStorage();

  // ── Domain state ─────────────────────────────────────────────────────────
  let products = Map.empty<Common.ProductId, Types.Product>();
  let sellers  = Map.empty<Common.SellerId,  Types.Seller>();
  let orders   = Map.empty<Common.OrderId,   Types.Order>();
  let reviews  = Map.empty<Common.ReviewId,  Types.Review>();

  let nextOrderId  : Common.Counter = { var value = 100 };
  let nextReviewId : Common.Counter = { var value = 100 };

  // ── Seed dummy sellers ───────────────────────────────────────────────────
  // 1. Ravi Textiles — Surat, Gujarat — verified — shirts/kurtas
  sellers.add("seller-001", {
    id           = "seller-001";
    name         = "Ravi Kumar";
    shopName     = "Ravi Textiles";
    city         = "Surat";
    pincode      = "395003";
    description  = "Premium quality shirts and kurtas straight from the looms of Surat. Trusted by 5,000+ customers across Gujarat.";
    shopImage    = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800";
    isVerified   = true;
    joinedAt     = 1_680_000_000_000_000_000;
    totalSales   = 1240;
    commissionRate = 0.15;
  });

  // 2. Priya Fashion House — Jaipur, Rajasthan — verified — dresses/ethnic
  sellers.add("seller-002", {
    id           = "seller-002";
    name         = "Priya Sharma";
    shopName     = "Priya Fashion House";
    city         = "Jaipur";
    pincode      = "302001";
    description  = "Ethnic dresses and fusion wear crafted by skilled artisans of Jaipur. Celebrating Rajasthani heritage with modern style.";
    shopImage    = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800";
    isVerified   = true;
    joinedAt     = 1_685_000_000_000_000_000;
    totalSales   = 870;
    commissionRate = 0.15;
  });

  // 3. Sneaker Street — Kanpur, UP — verified — shoes/footwear
  sellers.add("seller-003", {
    id           = "seller-003";
    name         = "Arjun Verma";
    shopName     = "Sneaker Street";
    city         = "Kanpur";
    pincode      = "208001";
    description  = "Top-brand sneakers and casual footwear at unbeatable prices. Kanpur's No.1 footwear destination since 2018.";
    shopImage    = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800";
    isVerified   = true;
    joinedAt     = 1_690_000_000_000_000_000;
    totalSales   = 2100;
    commissionRate = 0.15;
  });

  // 4. Urban Style Co — Lucknow, UP — NOT verified — hoodies/casual
  sellers.add("seller-004", {
    id           = "seller-004";
    name         = "Neha Singh";
    shopName     = "Urban Style Co";
    city         = "Lucknow";
    pincode      = "226001";
    description  = "Trendy hoodies and casual streetwear for the youth of Lucknow. New collection every month.";
    shopImage    = "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800";
    isVerified   = false;
    joinedAt     = 1_700_000_000_000_000_000;
    totalSales   = 320;
    commissionRate = 0.15;
  });

  // ── Seed dummy products ──────────────────────────────────────────────────
  // Shirts — seller-001 (Ravi Textiles, Surat, verified)
  products.add("prod-001", {
    id             = "prod-001";
    name           = "Men's Classic Formal Shirt";
    category       = "Shirts";
    price          = 1299;
    discountedPrice = 999;
    images         = ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"];
    description    = "Crisp white formal shirt crafted from 100% cotton. Perfect for office wear and festive occasions.";
    sellerId       = "seller-001";
    sellerName     = "Ravi Textiles";
    isVerified     = true;
    rating         = 4.5;
    reviewCount    = 128;
    hasFastDelivery = true;
    stock          = 85;
    city           = "Surat";
    createdAt      = 1_680_500_000_000_000_000;
  });

  products.add("prod-002", {
    id             = "prod-002";
    name           = "Men's Casual Striped Shirt";
    category       = "Shirts";
    price          = 899;
    discountedPrice = 699;
    images         = ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800"];
    description    = "Vibrant striped shirt for casual outings. Breathable fabric, slim fit design.";
    sellerId       = "seller-001";
    sellerName     = "Ravi Textiles";
    isVerified     = true;
    rating         = 4.2;
    reviewCount    = 74;
    hasFastDelivery = true;
    stock          = 120;
    city           = "Surat";
    createdAt      = 1_681_000_000_000_000_000;
  });

  // Dresses — seller-002 (Priya Fashion House, Jaipur, verified)
  products.add("prod-003", {
    id             = "prod-003";
    name           = "Women's Summer Flare Dress";
    category       = "Dresses";
    price          = 1599;
    discountedPrice = 1199;
    images         = ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800"];
    description    = "Elegant flare dress perfect for summer parties and casual brunches. Available in multiple sizes.";
    sellerId       = "seller-002";
    sellerName     = "Priya Fashion House";
    isVerified     = true;
    rating         = 4.7;
    reviewCount    = 215;
    hasFastDelivery = true;
    stock          = 60;
    city           = "Jaipur";
    createdAt      = 1_685_500_000_000_000_000;
  });

  products.add("prod-004", {
    id             = "prod-004";
    name           = "Women's Floral Ethnic Dress";
    category       = "Dresses";
    price          = 1899;
    discountedPrice = 1499;
    images         = ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"];
    description    = "Beautiful floral print ethnic dress with intricate embroidery. Handcrafted by Jaipur artisans.";
    sellerId       = "seller-002";
    sellerName     = "Priya Fashion House";
    isVerified     = true;
    rating         = 4.8;
    reviewCount    = 189;
    hasFastDelivery = false;
    stock          = 45;
    city           = "Jaipur";
    createdAt      = 1_686_000_000_000_000_000;
  });

  // Jeans — seller-001 (Ravi Textiles, Surat, verified)
  products.add("prod-005", {
    id             = "prod-005";
    name           = "Men's Blue Denim Jeans";
    category       = "Jeans";
    price          = 1499;
    discountedPrice = 1099;
    images         = ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"];
    description    = "Classic blue denim jeans with a comfortable mid-rise fit. Durable fabric for everyday wear.";
    sellerId       = "seller-001";
    sellerName     = "Ravi Textiles";
    isVerified     = true;
    rating         = 4.3;
    reviewCount    = 96;
    hasFastDelivery = true;
    stock          = 200;
    city           = "Surat";
    createdAt      = 1_682_000_000_000_000_000;
  });

  products.add("prod-006", {
    id             = "prod-006";
    name           = "Men's Slim Fit Jeans";
    category       = "Jeans";
    price          = 1699;
    discountedPrice = 1299;
    images         = ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"];
    description    = "Trendy slim fit jeans for a modern look. Stretch fabric ensures all-day comfort.";
    sellerId       = "seller-001";
    sellerName     = "Ravi Textiles";
    isVerified     = true;
    rating         = 4.4;
    reviewCount    = 112;
    hasFastDelivery = true;
    stock          = 150;
    city           = "Surat";
    createdAt      = 1_682_500_000_000_000_000;
  });

  // Shoes — seller-003 (Sneaker Street, Kanpur, verified)
  products.add("prod-007", {
    id             = "prod-007";
    name           = "Men's Bold Red Sneakers";
    category       = "Shoes";
    price          = 2199;
    discountedPrice = 1699;
    images         = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"];
    description    = "Eye-catching red sneakers with superior grip sole. Perfect for gym, casual outings, and sports.";
    sellerId       = "seller-003";
    sellerName     = "Sneaker Street";
    isVerified     = true;
    rating         = 4.6;
    reviewCount    = 340;
    hasFastDelivery = true;
    stock          = 75;
    city           = "Kanpur";
    createdAt      = 1_690_500_000_000_000_000;
  });

  products.add("prod-008", {
    id             = "prod-008";
    name           = "Unisex White Canvas Sneakers";
    category       = "Shoes";
    price          = 1599;
    discountedPrice = 1249;
    images         = ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800"];
    description    = "Clean white canvas sneakers for a minimalist look. Lightweight and breathable for daily wear.";
    sellerId       = "seller-003";
    sellerName     = "Sneaker Street";
    isVerified     = true;
    rating         = 4.4;
    reviewCount    = 278;
    hasFastDelivery = true;
    stock          = 90;
    city           = "Kanpur";
    createdAt      = 1_691_000_000_000_000_000;
  });

  // Hoodies — seller-004 (Urban Style Co, Lucknow, NOT verified)
  products.add("prod-009", {
    id             = "prod-009";
    name           = "Men's Casual Pullover Hoodie";
    category       = "Hoodies";
    price          = 1399;
    discountedPrice = 1099;
    images         = ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800"];
    description    = "Warm and cozy pullover hoodie for cooler days. Kangaroo pocket and adjustable drawstring.";
    sellerId       = "seller-004";
    sellerName     = "Urban Style Co";
    isVerified     = false;
    rating         = 3.9;
    reviewCount    = 54;
    hasFastDelivery = false;
    stock          = 110;
    city           = "Lucknow";
    createdAt      = 1_700_500_000_000_000_000;
  });

  products.add("prod-010", {
    id             = "prod-010";
    name           = "Men's Zip-Up Hoodie";
    category       = "Hoodies";
    price          = 1599;
    discountedPrice = 1249;
    images         = ["https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800"];
    description    = "Full-zip hoodie with ribbed cuffs and hem. Ideal for layering in winter and monsoon.";
    sellerId       = "seller-004";
    sellerName     = "Urban Style Co";
    isVerified     = false;
    rating         = 3.8;
    reviewCount    = 41;
    hasFastDelivery = true;
    stock          = 80;
    city           = "Lucknow";
    createdAt      = 1_701_000_000_000_000_000;
  });

  // Handbags — seller-002 (Priya Fashion House, Jaipur, verified)
  products.add("prod-011", {
    id             = "prod-011";
    name           = "Women's Structured Handbag";
    category       = "Handbags";
    price          = 2199;
    discountedPrice = 1699;
    images         = ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"];
    description    = "Elegant structured handbag with multiple compartments. Genuine PU leather with gold-tone hardware.";
    sellerId       = "seller-002";
    sellerName     = "Priya Fashion House";
    isVerified     = true;
    rating         = 4.7;
    reviewCount    = 163;
    hasFastDelivery = true;
    stock          = 40;
    city           = "Jaipur";
    createdAt      = 1_687_000_000_000_000_000;
  });

  products.add("prod-012", {
    id             = "prod-012";
    name           = "Women's Canvas Tote Bag";
    category       = "Handbags";
    price          = 799;
    discountedPrice = 599;
    images         = ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"];
    description    = "Spacious canvas tote bag with inner zipper pocket. Eco-friendly and perfect for shopping or college.";
    sellerId       = "seller-002";
    sellerName     = "Priya Fashion House";
    isVerified     = true;
    rating         = 4.5;
    reviewCount    = 98;
    hasFastDelivery = true;
    stock          = 200;
    city           = "Jaipur";
    createdAt      = 1_687_500_000_000_000_000;
  });

  // ── Seed dummy orders ────────────────────────────────────────────────────
  let sampleCustomer = Principal.fromText("2vxsx-fae");

  // Order 1 — Delivered, 2 items
  orders.add("order-001", {
    id               = "order-001";
    customerId       = sampleCustomer;
    items            = [
      { productId = "prod-001"; quantity = 1; price = 999;  productName = "Men's Classic Formal Shirt"; sellerName = "Ravi Textiles" },
      { productId = "prod-005"; quantity = 1; price = 1099; productName = "Men's Blue Denim Jeans";     sellerName = "Ravi Textiles" },
    ];
    totalAmount      = 2098;
    commissionAmount = 315; // 15% of 2098 ≈ 315
    status           = "Delivered";
    paymentId        = "pay_demo_001";
    createdAt        = 1_695_000_000_000_000_000;
    deliveryAddress  = "42, MG Road, Surat, Gujarat - 395003";
  });

  // Order 2 — Shipped, 1 item
  orders.add("order-002", {
    id               = "order-002";
    customerId       = sampleCustomer;
    items            = [
      { productId = "prod-007"; quantity = 1; price = 1699; productName = "Men's Bold Red Sneakers"; sellerName = "Sneaker Street" },
    ];
    totalAmount      = 1699;
    commissionAmount = 255; // 15% of 1699 ≈ 255
    status           = "Shipped";
    paymentId        = "pay_demo_002";
    createdAt        = 1_706_000_000_000_000_000;
    deliveryAddress  = "7, Civil Lines, Kanpur, UP - 208001";
  });

  // Order 3 — Pending, 3 items
  orders.add("order-003", {
    id               = "order-003";
    customerId       = sampleCustomer;
    items            = [
      { productId = "prod-003"; quantity = 1; price = 1199; productName = "Women's Summer Flare Dress";   sellerName = "Priya Fashion House" },
      { productId = "prod-011"; quantity = 1; price = 1699; productName = "Women's Structured Handbag";   sellerName = "Priya Fashion House" },
      { productId = "prod-012"; quantity = 2; price = 599;  productName = "Women's Canvas Tote Bag";      sellerName = "Priya Fashion House" },
    ];
    totalAmount      = 4096;
    commissionAmount = 614; // 15% of 4096 ≈ 614
    status           = "Pending";
    paymentId        = "";
    createdAt        = 1_713_000_000_000_000_000;
    deliveryAddress  = "12, Pink City Nagar, Jaipur, Rajasthan - 302001";
  });

  // ── Seed dummy reviews ───────────────────────────────────────────────────
  reviews.add("review-001", {
    id         = "review-001";
    productId  = "prod-001";
    customerId = sampleCustomer;
    rating     = 5;
    comment    = "Excellent fabric quality! The shirt fits perfectly and the stitching is very clean. Fast delivery too — received within 24 hours.";
    createdAt  = 1_695_500_000_000_000_000;
  });

  reviews.add("review-002", {
    id         = "review-002";
    productId  = "prod-003";
    customerId = sampleCustomer;
    rating     = 5;
    comment    = "Absolutely love this dress! The fabric is lightweight and perfect for summer. The flare cut is very flattering.";
    createdAt  = 1_696_000_000_000_000_000;
  });

  reviews.add("review-003", {
    id         = "review-003";
    productId  = "prod-007";
    customerId = sampleCustomer;
    rating     = 4;
    comment    = "Great sneakers! Very comfortable and the colour is exactly as shown. Only wish there were more size options available.";
    createdAt  = 1_706_500_000_000_000_000;
  });

  reviews.add("review-004", {
    id         = "review-004";
    productId  = "prod-011";
    customerId = sampleCustomer;
    rating     = 5;
    comment    = "Premium quality handbag at a great price. The hardware is sturdy and the compartments are very well organized.";
    createdAt  = 1_707_000_000_000_000_000;
  });

  reviews.add("review-005", {
    id         = "review-005";
    productId  = "prod-005";
    customerId = sampleCustomer;
    rating     = 4;
    comment    = "Good quality denim jeans. The fit is accurate to the size chart. Delivery was fast — arrived the next morning!";
    createdAt  = 1_695_200_000_000_000_000;
  });

  // ── Products / Orders / Auth API mixin ───────────────────────────────────
  include ProductsOrdersAuthApi(
    accessControlState,
    products,
    sellers,
    orders,
    reviews,
    nextOrderId,
    nextReviewId,
  );

  // ── Stripe payment integration ───────────────────────────────────────────
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  func requireStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?c)   { c };
    };
  };

  public shared ({ caller }) func createCheckoutSession(
    items      : [Stripe.ShoppingItem],
    successUrl : Text,
    cancelUrl  : Text,
  ) : async Text {
    await Stripe.createCheckoutSession(requireStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(requireStripeConfig(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
