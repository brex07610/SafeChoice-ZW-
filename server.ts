import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -- API Routes --

  // Q&A Module (In-memory mock for initial structure, will move to Firestore)
  let questions = [];

  app.post("/api/questions", (req, res) => {
    const { content, category } = req.body;
    if (!content || !category) return res.status(400).json({ error: "Missing fields" });
    
    const newQuestion = {
      id: uuidv4(),
      content,
      category,
      status: "pending",
      created_at: new Date().toISOString()
    };
    questions.push(newQuestion);
    res.status(201).json(newQuestion);
  });

  app.get("/api/questions", (req, res) => {
    const category = req.query.category as string;
    let filtered = questions.filter(q => q.status === "answered");
    if (category && category !== "all") {
      filtered = filtered.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    res.json(filtered);
  });

  // Clinic Locator (Mock data for Zimbabwe)
  const clinics = [
    { id: 1, name: "Harare Central Hospital - Youth Friendly Center", city: "Harare", province: "Harare", services: ["HIV_testing", "Family_Planning", "PrEP"], lat: -17.83, lng: 31.05, is_youth_friendly: true, phone: "+263242701000", hours: { mon: "8am-4pm", sat: "9am-12pm" } },
    { id: 2, name: "Gweru Wellness Center", city: "Gweru", province: "Midlands", services: ["VCT", "Counselling", "PrEP"], lat: -19.45, lng: 29.81, is_youth_friendly: true, phone: "+26354222000", hours: { mon: "8am-5pm" } },
    { id: 3, name: "Mpilo Royal Youth Service", city: "Bulawayo", province: "Bulawayo", services: ["HIV_testing", "PrEP", "Family_Planning"], lat: -20.15, lng: 28.58, is_youth_friendly: true, phone: "+2639212000", hours: { mon: "8am-4pm" } },
    { id: 4, name: "Mutare Student Hub", city: "Mutare", province: "Manicaland", services: ["Family_Planning", "Counselling"], lat: -18.97, lng: 32.67, is_youth_friendly: true, phone: "+26320202000", hours: { mon: "8am-5pm" } },
    { id: 5, name: "Avenues Clinic (Youth Wing)", city: "Harare", province: "Harare", services: ["VCT", "HIV_testing", "PrEP"], lat: -17.82, lng: 31.04, is_youth_friendly: true, phone: "+263242251180", hours: { mon: "24/7" } },
    { id: 6, name: "Bulawayo City Health Office", city: "Bulawayo", province: "Bulawayo", services: ["Family_Planning", "VCT"], lat: -20.16, lng: 28.59, is_youth_friendly: false, phone: "+263960000", hours: { mon: "8am-4pm" } },
    { id: 7, name: "Newlands Clinic", city: "Harare", province: "Harare", services: ["HIV_testing", "Counselling"], lat: -17.81, lng: 31.08, is_youth_friendly: true, phone: "+263242776363", hours: { mon: "8am-5pm" } },
  ];

  // Community Forum
  let posts = [
    { id: 1, user: "SupportPeer_92", category: "Support", content: "Just wanted to say that being on PrEP for 3 months now has really eased my anxiety. Stay safe out there!", upvotes: 24, comments: 8, time: new Date().toISOString() },
    { id: 2, user: "HealthFirst_ZW", category: "HIV", content: "Does anyone know if the clinic in Gweru is open on Saturdays for testing? I'm traveling there this weekend.", upvotes: 5, comments: 3, time: new Date().toISOString() },
  ];

  app.get("/api/posts", (req, res) => {
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { content, category, user } = req.body;
    const newPost = {
      id: posts.length + 1,
      user: user || `User_${Math.floor(Math.random() * 10000)}`,
      content,
      category,
      upvotes: 0,
      comments: 0,
      time: new Date().toISOString()
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
  });

  app.post("/api/posts/:id/upvote", (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (post) {
      post.upvotes += 1;
      res.json(post);
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  });

  // Integration with Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SafeChoice ZW Server running on http://localhost:${PORT}`);
  });
}

startServer();
