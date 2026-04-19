// mixins/products-orders-auth-api.mo — public API surface for products, orders, auth domain
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/products-orders-auth";
import Common "../types/common";
import Lib "../lib/products-orders-auth";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, Types.Product>,
  sellers : Map.Map<Common.SellerId, Types.Seller>,
  orders : Map.Map<Common.OrderId, Types.Order>,
  reviews : Map.Map<Common.ReviewId, Types.Review>,
  nextOrderId : Common.Counter,
  nextReviewId : Common.Counter,
) {
  // ── Product queries ──────────────────────────────────────────────────────

  /// Return all products on the platform.
  public query func getProducts() : async [Types.Product] {
    Lib.listProducts(products);
  };

  /// Return a product by its ID.
  public query func getProductById(id : Common.ProductId) : async ?Types.Product {
    Lib.findProduct(products, id);
  };

  /// Return products filtered by category.
  public query func getProductsByCategory(category : Text) : async [Types.Product] {
    Lib.filterByCategory(products, category);
  };

  /// Return a curated list of featured products.
  public query func getFeaturedProducts() : async [Types.Product] {
    Lib.featuredProducts(products);
  };

  // ── Seller queries ───────────────────────────────────────────────────────

  /// Return all sellers.
  public query func getSellers() : async [Types.Seller] {
    Lib.listSellers(sellers);
  };

  /// Return only verified sellers.
  public query func getVerifiedSellers() : async [Types.Seller] {
    Lib.verifiedSellers(sellers);
  };

  // ── Order functions ──────────────────────────────────────────────────────

  /// Return all orders belonging to the authenticated caller.
  public query ({ caller }) func getOrders(_customerId : Text) : async [Types.Order] {
    Lib.getOrdersForCustomer(orders, caller);
  };

  /// Create a new order from cart items.
  public shared ({ caller }) func createOrder(
    items : [Types.CartItem],
    totalAmount : Nat,
    deliveryAddress : Text,
  ) : async Types.Order {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required to place an order");
    };
    let order = Lib.buildOrder(nextOrderId.value, caller, items, products, totalAmount, deliveryAddress);
    orders.add(order.id, order);
    nextOrderId.value += 1;
    order;
  };

  /// Return a single order by ID.
  public query ({ caller }) func getOrderById(orderId : Common.OrderId) : async ?Types.Order {
    switch (Lib.findOrder(orders, orderId)) {
      case null { null };
      case (?o) {
        // Customers can only see their own orders; admins can see all
        if (o.customerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view this order");
        };
        ?o;
      };
    };
  };

  /// Update the status of an order (seller/admin only).
  public shared ({ caller }) func updateOrderStatus(orderId : Common.OrderId, status : Text) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    Lib.changeOrderStatus(orders, orderId, status);
  };

  // ── Review functions ─────────────────────────────────────────────────────

  /// Add a review for a product (authenticated users only).
  public shared ({ caller }) func addReview(productId : Common.ProductId, rating : Nat, comment : Text) : async Types.Review {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required to add a review");
    };
    let review = Lib.addReview(reviews, nextReviewId.value, productId, caller, rating, comment);
    nextReviewId.value += 1;
    review;
  };

  /// Return all reviews for a given product.
  public query func getReviews(productId : Common.ProductId) : async [Types.Review] {
    Lib.getReviewsForProduct(reviews, productId);
  };

  // ── Admin functions ──────────────────────────────────────────────────────

  /// Return platform-wide statistics (admin only).
  public query ({ caller }) func getAdminStats() : async Types.AdminStats {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };
    Lib.computeAdminStats(orders, sellers);
  };

  /// Verify a seller by ID (admin only).
  public shared ({ caller }) func verifySeller(sellerId : Common.SellerId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify sellers");
    };
    Lib.verifySeller(sellers, sellerId);
  };

  /// Return analytics data for the admin dashboard (admin only).
  public query ({ caller }) func getAnalytics() : async Types.Analytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    Lib.computeAnalytics(orders, products);
  };

  // ── Product management (seller / admin) ──────────────────────────────────

  /// Add or update a product (authenticated users).
  public shared ({ caller }) func upsertProduct(product : Types.Product) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required to manage products");
    };
    Lib.upsertProduct(products, product);
  };

  /// Delete a product by ID (seller / admin).
  public shared ({ caller }) func deleteProduct(productId : Common.ProductId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Login required to delete products");
    };
    Lib.removeProduct(products, productId);
  };

  /// Return products listed by a specific seller.
  public query func getSellerProducts(sellerId : Common.SellerId) : async [Types.Product] {
    let result = List.empty<Types.Product>();
    for ((_, p) in products.entries()) {
      if (p.sellerId == sellerId) { result.add(p) };
    };
    result.toArray();
  };

  // ── Seller / Admin order views ───────────────────────────────────────────

  /// Return all orders across the platform (admin only).
  public query ({ caller }) func getAllOrders() : async [Types.Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  /// Return orders that include products from a specific seller.
  public query func getSellerOrders(sellerId : Common.SellerId) : async [Types.Order] {
    let sellerProductIds = Map.empty<Common.ProductId, Bool>();
    for ((_, p) in products.entries()) {
      if (p.sellerId == sellerId) { sellerProductIds.add(p.id, true) };
    };
    let result = List.empty<Types.Order>();
    for ((_, o) in orders.entries()) {
      let hasItem = o.items.any(func(item : Types.OrderItem) : Bool {
        sellerProductIds.containsKey(item.productId)
      });
      if (hasItem) { result.add(o) };
    };
    result.toArray();
  };

  /// Return total earnings for a seller (sum of discountedPrice × quantity, minus 15% commission).
  public query func getSellerEarnings(sellerId : Common.SellerId) : async Nat {
    var earnings : Nat = 0;
    for ((_, o) in orders.entries()) {
      for (item in o.items.values()) {
        switch (products.get(item.productId)) {
          case (?p) {
            if (p.sellerId == sellerId) {
              let gross = item.price * item.quantity;
              let commission = gross * 15 / 100;
              earnings += gross - commission;
            };
          };
          case null {};
        };
      };
    };
    earnings;
  };

  /// Return all registered users (admin only) — returns principal list.
  public query ({ caller }) func getAllUsers() : async [Principal] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    // Return all unique customer principals from orders
    let seen = Map.empty<Principal, Bool>();
    for ((_, o) in orders.entries()) {
      seen.add(o.customerId, true);
    };
    seen.keys().toArray();
  };
};
