const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Static file middleware
app.use('/images', express.static('images'));

const uri = 'mongodb+srv://devopsajithv_db_user:qd86ekjBZY44sEt1@mdx-lab-cluster.ujnektz.mongodb.net/?retryWrites=true&w=majority&appName=mdx-lab-cluster';
const client = new MongoClient(uri);

let lessonsCollection, ordersCollection;

client.connect().then(() => {
  const db = client.db('cw1');
  lessonsCollection = db.collection('lessons');
  ordersCollection = db.collection('orders');
  console.log('Connected to MongoDB Atlas!');

  // ROUTES GO HERE

  // Test route
  app.get('/', (req, res) => {
    res.send('Express Server Working');
  });

  // GET /lessons
  app.get('/lessons', async (req, res) => {
    const lessons = await lessonsCollection.find().toArray();
    res.json(lessons);
  });

  // POST /orders
  app.post('/orders', async (req, res) => {
    const order = req.body;
    await ordersCollection.insertOne(order);
    res.json({ success: true });
  });

  // PUT /lessons/:id
  app.put('/lessons/:id', async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    await lessonsCollection.updateOne({ _id: new ObjectId(id) }, { $set: update });
    res.json({ success: true });
  });

  // GET /search?q=term
  app.get('/search', async (req, res) => {
    const q = req.query.q;
    const results = await lessonsCollection.find({
      $or: [
        { subject: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]
    }).toArray();
    res.json(results);
  });

  // Start server AFTER routes are defined
  app.listen(3000, () => console.log('Server running on port 3000'));
})
.catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});
