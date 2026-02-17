import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "@/models/User";
import Resource from "@/models/Resource";

const seedUsers = [
  { name: "Surya", email: "surya@notenova.com", password: "123456", department: "CSE", semester: "6", points: 45 },
  { name: "Dhinesh", email: "dhinesh@notenova.com", password: "123456", department: "ECE", semester: "4", points: 30 },
  { name: "Bhargav", email: "bhargav@notenova.com", password: "123456", department: "IT", semester: "5", points: 20 },
];

const seedResources = [
  { title: "Data Structures Complete Notes", description: "Comprehensive DSA notes covering arrays, trees, graphs, and dynamic programming with solved examples.", subject: "Data Structures", semester: "3", department: "CSE", downloads: 42, avgRating: 4.5 },
  { title: "Digital Electronics Lab Manual", description: "Complete lab manual with circuit diagrams, truth tables, and viva questions for all experiments.", subject: "Digital Electronics", semester: "4", department: "ECE", downloads: 28, avgRating: 4.2 },
  { title: "Operating Systems Question Bank", description: "Previous year questions with solutions covering process management, memory, and file systems.", subject: "Operating Systems", semester: "5", department: "CSE", downloads: 65, avgRating: 4.8 },
  { title: "Engineering Mathematics III", description: "Handwritten notes on Laplace transforms, Fourier series, and complex analysis.", subject: "Mathematics", semester: "3", department: "Common", downloads: 35, avgRating: 3.9 },
  { title: "Computer Networks Cheat Sheet", description: "One-page reference sheet covering OSI model, TCP/IP, subnetting, and protocols.", subject: "Computer Networks", semester: "5", department: "IT", downloads: 50, avgRating: 4.6 },
];

let seeded = false;

export async function runSeed() {
  if (seeded) return;
  await dbConnect();

  const existingCount = await User.countDocuments({ email: { $in: seedUsers.map((u) => u.email) } });
  if (existingCount >= 3) {
    seeded = true;
    return;
  }

  const userDocs = [];
  for (const u of seedUsers) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      userDocs.push(exists);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const created = await User.create({ ...u, password: hashed });
    userDocs.push(created);
  }

  const resourceCount = await Resource.countDocuments({});
  if (resourceCount === 0) {
    for (let i = 0; i < seedResources.length; i++) {
      await Resource.create({
        ...seedResources[i],
        uploadedBy: userDocs[i % userDocs.length]._id,
        fileUrl: "",
      });
    }
  }

  seeded = true;
}
