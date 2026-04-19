// types/products-orders-auth.mo — domain-specific types for products, orders, auth
import Common "common";

module {
  // Product entity — represents a fashion item listed by a seller
  public type Product = {
    id : Common.ProductId;
    name : Text;
    category : Text; // matches ProductCategory variants as text
    price : Nat;
    discountedPrice : Nat;
    images : [Text]; // direct Unsplash URLs
    description : Text;
    sellerId : Common.SellerId;
    sellerName : Text;
    isVerified : Bool;
    rating : Float;
    reviewCount : Nat;
    hasFastDelivery : Bool;
    stock : Nat;
    city : Text;
    createdAt : Common.Timestamp;
  };

  // Seller entity — represents a local shop/seller on the platform
  public type Seller = {
    id : Common.SellerId;
    name : Text;
    shopName : Text;
    city : Text;
    pincode : Text;
    description : Text;
    shopImage : Text; // direct Unsplash URL
    isVerified : Bool;
    joinedAt : Common.Timestamp;
    totalSales : Nat;
    commissionRate : Float; // default 0.15 (15%)
  };

  // Order item — a single product line in an order
  public type OrderItem = {
    productId : Common.ProductId;
    quantity : Nat;
    price : Nat;
    productName : Text;
    sellerName : Text;
  };

  // Cart item — used when submitting a new order
  public type CartItem = {
    productId : Common.ProductId;
    quantity : Nat;
    price : Nat;
  };

  // Order entity — a customer purchase
  public type Order = {
    id : Common.OrderId;
    customerId : Common.UserId;
    items : [OrderItem];
    totalAmount : Nat;
    commissionAmount : Nat; // 15% of totalAmount
    status : Text; // matches OrderStatus variants as text
    paymentId : Text;
    createdAt : Common.Timestamp;
    deliveryAddress : Text;
  };

  // Review entity — product rating and comment by a customer
  public type Review = {
    id : Common.ReviewId;
    productId : Common.ProductId;
    customerId : Common.UserId;
    rating : Nat; // 1–5
    comment : Text;
    createdAt : Common.Timestamp;
  };

  // Admin statistics snapshot
  public type AdminStats = {
    totalRevenue : Nat;
    totalOrders : Nat;
    totalCommission : Nat;
    pendingVerifications : Nat;
  };

  // Analytics payload
  public type Analytics = {
    monthlyRevenue : [Nat];
    topCategories : [(Text, Nat)];
    growth : Float;
  };
};
