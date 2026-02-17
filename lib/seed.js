import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "@/models/User";
import Resource from "@/models/Resource";

const seedUsers = [
  { name: "Surya", email: "surya@notenova.com", password: "123456", college: "Christ University", department: "CSE", semester: "6", points: 45 },
  { name: "Dhinesh", email: "dhinesh@notenova.com", password: "123456", college: "Christ University", department: "ECE", semester: "4", points: 30 },
  { name: "Bhargav", email: "bhargav@notenova.com", password: "123456", college: "Christ University", department: "IT", semester: "5", points: 20 },
];

const seedResources = [
  { title: "Data Structures Complete Notes", description: "Comprehensive DSA notes covering arrays, trees, graphs, and dynamic programming with solved examples.", subject: "Data Structures", semester: "3", department: "CSE", resourceType: "Notes", yearBatch: "2024-25", tags: ["dsa", "algorithms", "trees", "graphs"], isPublic: true, downloads: 42, avgRating: 4.5 },
  { title: "Digital Electronics Lab Manual", description: "Complete lab manual with circuit diagrams, truth tables, and viva questions for all experiments.", subject: "Digital Electronics", semester: "4", department: "ECE", resourceType: "Study Material", yearBatch: "2024-25", tags: ["digital-electronics", "lab", "circuits"], isPublic: true, downloads: 28, avgRating: 4.2 },
  { title: "Operating Systems Question Bank", description: "Previous year questions with solutions covering process management, memory, and file systems.", subject: "Operating Systems", semester: "5", department: "CSE", resourceType: "Question Papers", yearBatch: "2023-24", tags: ["os", "process", "memory", "mid-term"], isPublic: false, downloads: 65, avgRating: 4.8 },
  { title: "Engineering Mathematics III", description: "Handwritten notes on Laplace transforms, Fourier series, and complex analysis.", subject: "Mathematics", semester: "3", department: "Common", resourceType: "Notes", yearBatch: "2024-25", tags: ["math", "laplace", "fourier"], isPublic: true, downloads: 35, avgRating: 3.9 },
  { title: "Computer Networks Cheat Sheet", description: "One-page reference sheet covering OSI model, TCP/IP, subnetting, and protocols.", subject: "Computer Networks", semester: "5", department: "IT", resourceType: "Study Material", yearBatch: "2023-24", tags: ["networking", "osi", "tcp-ip", "protocols"], isPublic: true, downloads: 50, avgRating: 4.6 },
];

let seeded = false;

export async function runSeed() {
  if (seeded) return;
  await dbConnect();

  const userDocs = [];
  for (const u of seedUsers) {
    let existing = await User.findOne({ email: u.email });
    if (existing) {
      // Update existing seed users if missing new fields
      if (!existing.college || !existing.department) {
        existing.college = u.college;
        existing.department = existing.department || u.department;
        existing.semester = existing.semester || u.semester;
        existing.points = existing.points || u.points;
        await existing.save();
      }
      userDocs.push(existing);
    } else {
      const hashed = await bcrypt.hash(u.password, 10);
      const created = await User.create({ ...u, password: hashed });
      userDocs.push(created);
    }
  }

  // Re-seed resources if they're missing new fields (resourceType)
  const existingResources = await Resource.find({});
  const needsReseed = existingResources.length === 0 || existingResources.some((r) => !r.resourceType);

  if (needsReseed) {
    // Delete old seed resources without resourceType and recreate
    await Resource.deleteMany({ resourceType: { $exists: false } });
    await Resource.deleteMany({ resourceType: null });
    await Resource.deleteMany({ resourceType: "" });

    const currentCount = await Resource.countDocuments({});
    if (currentCount === 0) {
      for (let i = 0; i < seedResources.length; i++) {
        await Resource.create({
          ...seedResources[i],
          uploadedBy: userDocs[i % userDocs.length]._id,
          fileUrl: "",
        });
      }
    }
  }

  seeded = true;
}
