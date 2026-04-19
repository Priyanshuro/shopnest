// types/common.mo — cross-cutting types shared across all domains
module {
  public type Timestamp = Int;
  public type UserId = Principal;
  public type ProductId = Text;
  public type OrderId = Text;
  public type SellerId = Text;
  public type ReviewId = Text;

  // Product category enum
  public type ProductCategory = {
    #Shirts;
    #Dresses;
    #Jeans;
    #Shoes;
    #Hoodies;
    #Handbags;
    #Accessories;
  };

  // Order status enum
  public type OrderStatus = {
    #Pending;
    #Confirmed;
    #Shipped;
    #Delivered;
    #Cancelled;
  };

  // Mutable counter — passed by reference to mixins so increments are visible in actor state
  public type Counter = { var value : Nat };
};
