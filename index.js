const { response } = require("express")
const express= require("express")
const app= express()
require("./db/config")
const User= require("./db/Users")
const Product= require("./db/Product")
const cors= require("cors")

app.use(express.json())
app.use(cors())

const Jwt= require("jsonwebtoken")
const jwtKey= "e-com"

app.post("/register", verifyToken, async (req, res) => {
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send("Something is wrong, try again");
    } else {
      res.send({ result, token });
    }
  });
});

//Login Without JWT
// app.post("/login",async (req, res)=>{
//     console.log(req.body)
//     if(req.body.password && req.body.email){
//          let user = await User.findOne(req.body).select("-password");
//          if (user) {
          
//            res.send(user);
//          } else {
//            res.send("No User Found!")
//          }
//     }else{
// res.send("No Use!")
//     }
// })

//Login With JWT
app.post("/login",  async (req, res) => {
  console.log(req.body);
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send("Something is wrong, try again");
        } else {
          res.send({ user, token });
        }
      });
    }
  }
});

app.post("/add-product",verifyToken,async (req, res)=>{
    let product= new Product(req.body)
    let result=await product.save()
    res.send(result)
})

app.get("/products",verifyToken,async (req, res)=>{
  let products=await Product.find()
  if (products.length>0){
    res.send(products)
  }else{
    res.send("Add Some First")
  }
})

app.delete("/product/:id", verifyToken, async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});

app.get("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No record found!" });
  }
});

app.put("/product/:id", verifyToken, async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key",verifyToken, async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { userId: { $regex: req.params.key } }
    ],
  });
  res.send(result);
})

function verifyToken(req, res, next){
  let token= req.headers["authorization"]
  if (token){
    token= token.split(' ')[1];
    Jwt.verify(token, jwtKey, (err, valid)=>{
      if(err){
        res.status(401).send({result:"Please provide valid token"})
      }else{
      next();
      }
    })
  } else{
      res.status(403).send ({result:"Please add token with header"})
  }
}


app.listen(5005)