const Order = require("./Order");
const pizzaSize = ["large", "medium", "small"];
const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  SIZE: Symbol("size"),
  TOPPINGS: Symbol("toppings"),
  BURGER: Symbol("burger"),
  BURGER_SIZE: Symbol("burger_size"),
  BURGER_TOPPINGS: Symbol("burger_toppings"),
  WINGS: Symbol("wings"),
  UPORDER: Symbol("uporder"),
  DRINKS: Symbol("drinks"),
  PAYMENT: Symbol("payment")
});
const burgerPrice = {
  large: 10,
  medium: 7.5,
  small: 5
};
const yesNo = ["yes", "no"];

const pizzaPrice = {
  large: 10,
  medium: 7.5,
  small: 5
};
const drinksPrice = 2;
const wingsPrice = 4;
const taxPercent = 0.10;

module.exports = class ShwarmaOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize = "";
    this.sBuger = "";
    this.sBuger_size = "";
    this.sBuger_toppings = "";
    this.sWings = "";
    this.upOrder = "";
    this.sToppings = "";
    this.sDrinks = "";
    this.sItem = "shawarama";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE;
        aReturn.push("Welcome to Richard's Shawarma.");
        aReturn.push("What size would you like large small medium?");
        break;
      case OrderState.SIZE:             
        if (!pizzaSize.includes(sInput.toLowerCase())) {
          aReturn.push("Please select large small medium");
          break;
        }else{
          this.stateCur = OrderState.TOPPINGS 
          this.sSize = sInput.toLowerCase();
          aReturn.push("What toppings would you like?");
        }
        break;
      case OrderState.TOPPINGS:
        this.stateCur = OrderState.BURGER
        this.sToppings = sInput;
        aReturn.push("Would you like to have Burger yes or no?");
        break;
      case OrderState.BURGER:       
        if(!yesNo.includes(sInput.toLowerCase())){
          aReturn.push("Please enter yes or no");
          break;
        }
        if (sInput.toLowerCase() != "no") {
          this.sBuger = sInput;
          this.stateCur = OrderState.BURGER_SIZE
          aReturn.push("What size would you like large small medium?");
        } else {
          this.stateCur = OrderState.WINGS
          aReturn.push("Would you like to have Wings?");
        }
        break;
      case OrderState.BURGER_SIZE:
        if (!pizzaSize.includes(sInput.toLowerCase())) {
          aReturn.push("Please select large small medium");
          break;
        }else{
        this.stateCur = OrderState.BURGER_TOPPINGS
        this.sBuger_size = sInput.toLowerCase();
        aReturn.push("Would you like to have toppings for Burger?");
        }
        break;
      case OrderState.BURGER_TOPPINGS:
        this.stateCur = OrderState.WINGS
        if (sInput.toLowerCase() != "no") {
          this.sBuger_toppings = sInput;
        }
        aReturn.push("Would you like to have Wings?");
        break;
      case OrderState.WINGS:
        this.stateCur = OrderState.UPORDER
        if (sInput.toLowerCase() != "no") {
          this.sWings = sInput;
        }
        aReturn.push("Would you like French Fries with the Order?");
        break;
      case OrderState.UPORDER:
        this.stateCur = OrderState.DRINKS
        if (sInput.toLowerCase() != "no") {
          this.upOrder = sInput;
        }
        aReturn.push("Would you like drinks with that?");
        break;
      case OrderState.DRINKS:
        this.stateCur = OrderState.PAYMENT;

        if (sInput.toLowerCase() != "no") {
          this.sDrinks = sInput;
        }
        aReturn.push("Thank-you for your order of");
        aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}`);
        if (this.sBuger) {
          if (this.sBuger_toppings) {
            aReturn.push(`${this.sBuger_size} Burger with  ${this.sBuger_toppings}`);
          } else {
            aReturn.push(`${this.sBuger_size} Burger`);
          }
        }
        if (this.sWings) {
          aReturn.push(` Wings`);
        }

        if (this.sDrinks) {
          aReturn.push(this.sDrinks);
        }
        let subtotalPrice = pizzaPrice[this.sSize];
        if (this.sBuger) {
          subtotalPrice = subtotalPrice + burgerPrice[this.sBuger_size];
        }
        if (this.bDrinks) {
          subtotalPrice = subtotalPrice + drinksPrice;
        }
        if (this.sWings) {
          subtotalPrice = subtotalPrice + wingsPrice;
        }

        let totalTax = subtotalPrice * taxPercent;
        let totalPrice = subtotalPrice + totalTax;
        this.nOrder = totalPrice;
        aReturn.push(`Please pay for your order here`);
        aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        break;
      case OrderState.PAYMENT:
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered at ${d.toTimeString()} to
        ${sInput.purchase_units[0].shipping.address.address_line_1}
        ${sInput.purchase_units[0].shipping.address.admin_area_2}
        ${sInput.purchase_units[0].shipping.address.admin_area_1} 
        ${sInput.purchase_units[0].shipping.address.postal_code} 
        ${sInput.purchase_units[0].shipping.address.country_code}
                 `);
        break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") {
    // your client id should be kept private
    if (sTitle != "-1") {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") {
      this.nOrder = sAmount;
    }
    const sClientID = process.env.SB_CLIENT_ID || 'ATMuMbzL7VLk1-79ZRcz_9ZzGX1oroS8KnaIk4bdBntUdUa4v5FOwe7m9vO8-JJm2e1MN_zA2zxbXFUW'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}