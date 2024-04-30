const { Card, ListGroup, Button, Container, Row, Col, Image, Input } =
  ReactBootstrap;

// simulate getting products from DataBase
const products = [
  {
    id: 1,
    attributes: {
      name: "Apples__",
      country: "Italy",
      cost: 3,
      instock: 10,
    },
  },
  {
    id: 2,
    attributes: {
      name: "Oranges",
      country: "Spain",
      cost: 4,
      instock: 3,
    },
  },
  {
    id: 3,
    attributes: {
      name: "Beans",
      country: "USA",
      cost: 2,
      instock: 8,
    },
  },
  {
    id: 4,
    attributes: {
      name: "Cabbage",
      country: "USA",
      cost: 1,
      instock: 8,
    },
  },
  {
    id: 5,
    attributes: {
      name: "Nuts",
      country: "Mexico",
      cost: 8,
      instock: 3,
    },
  },
  {
    id: 6,
    attributes: {
      name: "Bananas",
      country: "Australia",
      cost: 5,
      instock: 20,
    },
  },
];

// Custom hook to fetch data
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

// Reducer for data fetching
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const ProductCard = ({ item, index, addToCart }) => {
    const photos = [
      "images/apple.png",
      "images/orange.png",
      "images/beans.png",
      "images/cabbage.png",
      "images/nuts.jpg",
      "images/banana.jpg",
    ];
  
    return (
      <Col key={index} xs={12} sm={6} md={4} className="mb-3">
        {/* Set a fixed height for the Card */}
        <Card className="h-100"> 
          <Card.Img src={photos[index % 6]} variant="top" className="card-img-top"></Card.Img>
          <Card.Body className="d-flex flex-column">
            <Card.Title className="flex-grow-1">{item.attributes.name}</Card.Title>
            <Card.Text>${item.attributes.cost} each</Card.Text>
            <Card.Text className="text-muted">{item.attributes.instock} in stock</Card.Text> 

            <Button
              name={item.attributes.name}
              onClick={addToCart}
              className="mt-auto btn btn-primary"
            >
              Add to Cart
            </Button>
          </Card.Body>
     
        </Card>
      </Col>
    );
  };
  
  
  
const CartItem = ({ item, index, deleteCartItem }) => {
    const totalCost = item.attributes.cost * item.quantity;
  
    return (
      <ListGroup.Item key={index}>
        <Row className="align-items-center">
          <Col sm={8}>
            {item.quantity} x {item.attributes.name} from {item.attributes.country}
          </Col>
  
          <Col className="text-right">$ {totalCost}</Col>
  
          <Col
            onClick={() => deleteCartItem(index)}
            className="btn btn-link text-right"
          >
            Delete
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };
  

// Main Products component
const Store = () => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const query = "http://localhost:1337/api/products";
  const [status, setStatus] = React.useState(null);

  const [{ data, isLoading, isError }, doFetch] = useDataApi(query, {
    data: [],
  });

  //  Fetch Data from API
  React.useEffect(() => {
    doFetch(query);
    if (data.data.length > 0) {
      setItems(data.data);
    }
  }, [query, data]);

  // Add item to cart and update quantity in stock
  const addToCart = (e) => {
    const name = e.target.name;
    const item = items.find((product) => product.attributes.name === name);

    if (item && item.attributes.instock > 0) {
      const existingItem = cart.find((cartItem) => cartItem.attributes.name === name);
      if (existingItem) {
        const updatedCart = cart.map((cartItem) =>
          cartItem.attributes.name === name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        setCart(updatedCart);
      } else {
        setCart([...cart, { ...item, quantity: 1 }]);
      }
      setItems((prevItems) =>
        prevItems.map((product) => {
          if (
            product.attributes.name === name &&
            product.attributes.instock > 0
          ) {
            return {
              ...product,
              attributes: {
                ...product.attributes,
                instock: product.attributes.instock - 1,
              },
            };
          }
          return product;
        })
      );
    } else {
      alert("Out of stock!");
    }
  };

  // Delete item from cart and update the stock
  // Delete one instance of the item from the cart
const deleteCartItem = (index) => {
    const deletedItem = cart[index];
    let newCart = [...cart]; // Create a copy of the cart array
  
    if (deletedItem.quantity > 1) {
      // If the quantity is more than 1, decrease the quantity
      newCart[index] = { ...deletedItem, quantity: deletedItem.quantity - 1 };
    } else {
      // If the quantity is 1, remove the item entirely
      newCart = newCart.filter((item, i) => i !== index);
    }
  
    setCart(newCart);
  
    if (deletedItem) {
      setItems((prevItems) =>
        prevItems.map((product) => {
          if (product.attributes.name === deletedItem.attributes.name) {
            return {
              ...product,
              attributes: {
                ...product.attributes,
                instock: product.attributes.instock + 1,
              },
            };
          }
          return product;
        })
      );
    }
  };
  

  const cartItemCount = (itemName) => {
    const itemInCart = cart.find((item) => item.attributes.name === itemName);
    return itemInCart ? itemInCart.quantity : 0;
  };

  let productList = items.map((item, index) => {
    return (
      <ProductCard
        key={index}
        item={item}
        index={index}
        addToCart={addToCart}
      />
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <CartItem
        key={index}
        item={item}
        index={index}
        deleteCartItem={deleteCartItem}
      />
    );
  });

  let finalList = () => {
    let total = cart.reduce((total, item) => total + item.attributes.cost * item.quantity, 0);
    return total;
  };

  // Clear cart + restock products
  const checkOut = () => {
    setCart([]);
  };

  // Restock products
  const restockProducts = (url) => {
    console.log(`Restocking Products ${url}`);
    doFetch(url);
    if (data.data.length > 0) {
      setItems(data.data);
    } else {
      setItems(products);
    }
    setStatus("Products Restocked!");

    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  return (
    <Container>
      <Col className="mb-5">
        <Row className="justify-content-between mb-3">
          <h3>Product List</h3>
          <Button onClick={() => restockProducts(query)}>
            Restock Products
          </Button>
        </Row>
        {status && <div className="alert alert-info">{status}</div>}
        <Row>{productList}</Row>
      </Col>

      <Col className="d-flex flex-column mb-5">
        <Row>
          <h3>Shopping Cart</h3>
        </Row>

        <ListGroup>{cartList}</ListGroup>
        <Row className="justify-content-end mb-3 mt-3">
          <div className="btn font-weight-bold text-uppercase">
            Total: $ {finalList()}
          </div>
        </Row>
        <Row className="justify-content-end" style={{ gap: "1rem" }}>
          <Button disabled={finalList() === 0} onClick={checkOut}>
            CheckOut
          </Button>
        </Row>
      </Col>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Store />, document.getElementById("root"));
