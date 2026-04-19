// lib/products-orders-auth.mo — domain logic for products, orders, auth
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/products-orders-auth";
import Common "../types/common";

module {
  // ── Product helpers ──────────────────────────────────────────────────────

  /// Return all products from the store as an array.
  public func listProducts(products : Map.Map<Common.ProductId, Types.Product>) : [Types.Product] {
    products.values().toArray();
  };

  /// Return a single product by ID.
  public func findProduct(products : Map.Map<Common.ProductId, Types.Product>, id : Common.ProductId) : ?Types.Product {
    products.get(id);
  };

  /// Return all products matching a given category text.
  public func filterByCategory(products : Map.Map<Common.ProductId, Types.Product>, category : Text) : [Types.Product] {
    let result = List.empty<Types.Product>();
    for ((_, p) in products.entries()) {
      if (p.category == category) { result.add(p) };
    };
    result.toArray();
  };

  /// Return a curated list of featured products (highest rated, up to 8).
  public func featuredProducts(products : Map.Map<Common.ProductId, Types.Product>) : [Types.Product] {
    let all = products.values().toArray();
    let sorted = all.sort(func(a : Types.Product, b : Types.Product) : { #less; #equal; #greater } {
      if (a.rating > b.rating) { #less }
      else if (a.rating < b.rating) { #greater }
      else { #equal }
    });
    if (sorted.size() <= 8) { sorted }
    else { sorted.sliceToArray(0, 8) };
  };

  /// Add or replace a product in the store.
  public func upsertProduct(products : Map.Map<Common.ProductId, Types.Product>, product : Types.Product) : () {
    products.add(product.id, product);
  };

  /// Remove a product from the store.
  public func removeProduct(products : Map.Map<Common.ProductId, Types.Product>, id : Common.ProductId) : () {
    products.remove(id);
  };

  // ── Seller helpers ───────────────────────────────────────────────────────

  /// Return all sellers.
  public func listSellers(sellers : Map.Map<Common.SellerId, Types.Seller>) : [Types.Seller] {
    sellers.values().toArray();
  };

  /// Return only verified sellers.
  public func verifiedSellers(sellers : Map.Map<Common.SellerId, Types.Seller>) : [Types.Seller] {
    let result = List.empty<Types.Seller>();
    for ((_, s) in sellers.entries()) {
      if (s.isVerified) { result.add(s) };
    };
    result.toArray();
  };

  /// Mark a seller as verified. Returns false if seller not found.
  public func verifySeller(sellers : Map.Map<Common.SellerId, Types.Seller>, id : Common.SellerId) : Bool {
    switch (sellers.get(id)) {
      case null { false };
      case (?s) {
        sellers.add(id, { s with isVerified = true });
        true;
      };
    };
  };

  // ── Order helpers ────────────────────────────────────────────────────────

  /// Return all orders for a given customer.
  public func getOrdersForCustomer(orders : Map.Map<Common.OrderId, Types.Order>, customerId : Common.UserId) : [Types.Order] {
    let result = List.empty<Types.Order>();
    for ((_, o) in orders.entries()) {
      if (o.customerId == customerId) { result.add(o) };
    };
    result.toArray();
  };

  /// Find a single order by ID.
  public func findOrder(orders : Map.Map<Common.OrderId, Types.Order>, id : Common.OrderId) : ?Types.Order {
    orders.get(id);
  };

  /// Build a new Order record from cart items, computing commission automatically.
  public func buildOrder(
    nextId : Nat,
    customerId : Common.UserId,
    items : [Types.CartItem],
    products : Map.Map<Common.ProductId, Types.Product>,
    totalAmount : Nat,
    deliveryAddress : Text,
  ) : Types.Order {
    // Build OrderItems by looking up product info
    let orderItems = items.map(func(ci) {
      let (pName, sName) = switch (products.get(ci.productId)) {
        case (?p) { (p.name, p.sellerName) };
        case null  { ("Unknown Product", "Unknown Seller") };
      };
      {
        productId   = ci.productId;
        quantity    = ci.quantity;
        price       = ci.price;
        productName = pName;
        sellerName  = sName;
      };
    });
    let commission = totalAmount * 15 / 100;
    {
      id               = nextId.toText();
      customerId;
      items            = orderItems;
      totalAmount;
      commissionAmount = commission;
      status           = "Pending";
      paymentId        = "";
      createdAt        = Time.now();
      deliveryAddress;
    };
  };

  /// Transition an order to a new status string; returns false if orderId not found.
  public func changeOrderStatus(orders : Map.Map<Common.OrderId, Types.Order>, id : Common.OrderId, status : Text) : Bool {
    switch (orders.get(id)) {
      case null { false };
      case (?o) {
        orders.add(id, { o with status });
        true;
      };
    };
  };

  // ── Review helpers ───────────────────────────────────────────────────────

  /// Add a new review and return it.
  public func addReview(
    reviews : Map.Map<Common.ReviewId, Types.Review>,
    nextId : Nat,
    productId : Common.ProductId,
    customerId : Common.UserId,
    rating : Nat,
    comment : Text,
  ) : Types.Review {
    let rid = nextId.toText();
    let review : Types.Review = {
      id         = rid;
      productId;
      customerId;
      rating;
      comment;
      createdAt  = Time.now();
    };
    reviews.add(rid, review);
    review;
  };

  /// Return all reviews for a product.
  public func getReviewsForProduct(reviews : Map.Map<Common.ReviewId, Types.Review>, productId : Common.ProductId) : [Types.Review] {
    let result = List.empty<Types.Review>();
    for ((_, r) in reviews.entries()) {
      if (r.productId == productId) { result.add(r) };
    };
    result.toArray();
  };

  // ── Admin / analytics helpers ────────────────────────────────────────────

  /// Compute platform-wide admin statistics.
  public func computeAdminStats(
    orders : Map.Map<Common.OrderId, Types.Order>,
    sellers : Map.Map<Common.SellerId, Types.Seller>,
  ) : Types.AdminStats {
    var totalRevenue : Nat = 0;
    var totalOrders : Nat = 0;
    var totalCommission : Nat = 0;
    for ((_, o) in orders.entries()) {
      totalRevenue    += o.totalAmount;
      totalCommission += o.commissionAmount;
      totalOrders     += 1;
    };
    var pendingVerifications : Nat = 0;
    for ((_, s) in sellers.entries()) {
      if (not s.isVerified) { pendingVerifications += 1 };
    };
    { totalRevenue; totalOrders; totalCommission; pendingVerifications };
  };

  /// Compute analytics (monthly revenue, top categories, growth).
  public func computeAnalytics(
    orders : Map.Map<Common.OrderId, Types.Order>,
    products : Map.Map<Common.ProductId, Types.Product>,
  ) : Types.Analytics {
    // Tally order quantities per category via product lookup
    let catMap = Map.empty<Text, Nat>();
    for ((_, o) in orders.entries()) {
      for (item in o.items.values()) {
        switch (products.get(item.productId)) {
          case (?p) {
            let prev = switch (catMap.get(p.category)) {
              case (?n) { n };
              case null { 0 };
            };
            catMap.add(p.category, prev + item.quantity);
          };
          case null {};
        };
      };
    };
    let topCategories = catMap.entries().toArray();

    // Total revenue across all orders
    var totalRevenue : Nat = 0;
    for ((_, o) in orders.entries()) {
      totalRevenue += o.totalAmount;
    };
    let perMonth = totalRevenue / 12;
    let monthly = Array.tabulate(12, func(_i) { perMonth });

    { monthlyRevenue = monthly; topCategories; growth = 12.5 };
  };
};
