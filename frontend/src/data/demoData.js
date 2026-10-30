export const demoJobs = [
  {
    id: "job-1", company: "TCS", role: "Graduate Software Engineer", location: "Pune / Hybrid",
    package: "₹7.2 LPA", deadline: "2026-10-08", openings: 12,
    skills: ["Java", "SQL", "DSA", "Git"], eligibility: "B.Tech CSE/IT • CGPA 7+",
    description: "Build and maintain enterprise applications with cross-functional engineering teams."
  },
  {
    id: "job-2", company: "Deloitte", role: "Analyst – Technology", location: "Bengaluru",
    package: "₹8.5 LPA", deadline: "2026-10-12", openings: 8,
    skills: ["Python", "SQL", "Power BI", "Communication"], eligibility: "B.Tech • CGPA 7.5+",
    description: "Work on data-driven technology consulting and business transformation projects."
  },
  {
    id: "job-3", company: "Microsoft", role: "Software Engineering Intern", location: "Hyderabad",
    package: "₹80K/month", deadline: "2026-10-20", openings: 5,
    skills: ["Python", "Java", "DSA", "Git", "React"], eligibility: "Pre-final year CSE/IT",
    description: "Collaborate with engineering teams to build reliable software products."
  },
  {
    id: "job-4", company: "Infosys", role: "Systems Engineer", location: "Noida",
    package: "₹6.5 LPA", deadline: "2026-10-15", openings: 20,
    skills: ["Java", "SQL", "Communication"], eligibility: "B.Tech • CGPA 6.5+",
    description: "Develop, test and support technology solutions for enterprise clients."
  }
];

export const demoStudents = [
  {
    id: "stu-1", name: "Aarav Sharma", collegeId: "TI24CSE041", rollNo: "CSE-041",
    email: "aarav.demo@tulas.edu.in", branch: "CSE", year: "3rd Year", phone: "98XXXXXX12",
    cgpa: 8.6, skills: ["Java", "SQL", "Python", "DSA", "Git"], status: "Placed",
    applications: 5, interviews: 3, projects: ["Expense Manager", "MediDrone"]
  },
  {
    id: "stu-2", name: "Riya Verma", collegeId: "TI24CSE052", rollNo: "CSE-052",
    email: "riya.demo@tulas.edu.in", branch: "CSE", year: "3rd Year", phone: "97XXXXXX43",
    cgpa: 8.1, skills: ["Python", "React", "SQL", "Firebase"], status: "In Process",
    applications: 4, interviews: 2, projects: ["Campus Connect"]
  },
  {
    id: "stu-3", name: "Kabir Singh", collegeId: "TI24CSE067", rollNo: "CSE-067",
    email: "kabir.demo@tulas.edu.in", branch: "CSE", year: "3rd Year", phone: "96XXXXXX71",
    cgpa: 7.4, skills: ["Java", "C++", "DSA", "Git"], status: "Searching",
    applications: 2, interviews: 1, projects: ["Algo Visualizer"]
  },
  {
    id: "stu-4", name: "Mehak Gupta", collegeId: "TI24CSE078", rollNo: "CSE-078",
    email: "mehak.demo@tulas.edu.in", branch: "CSE", year: "3rd Year", phone: "95XXXXXX88",
    cgpa: 8.9, skills: ["Python", "SQL", "Power BI", "React"], status: "Placed",
    applications: 7, interviews: 4, projects: ["Placement Analytics"]
  }
];

export const demoApplications = [
  { id: "app-1", jobId: "job-1", company: "TCS", role: "Graduate Software Engineer", status: "Interview", appliedOn: "18 Sep 2026" },
  { id: "app-2", jobId: "job-2", company: "Deloitte", role: "Analyst – Technology", status: "Shortlisted", appliedOn: "16 Sep 2026" },
  { id: "app-3", jobId: "job-4", company: "Infosys", role: "Systems Engineer", status: "Under Review", appliedOn: "14 Sep 2026" }
];

export const demoInterviews = [
  { company: "TCS", role: "Graduate Software Engineer", date: "28 Sep 2026", time: "11:00 AM", mode: "Online", status: "Scheduled", link: "https://meet.example.com/placesmart" },
  { company: "Deloitte", role: "Analyst – Technology", date: "30 Sep 2026", time: "02:00 PM", mode: "Campus", status: "Scheduled", link: "Placement Cell – Seminar Hall" }
];

export const demoNotices = [
  { title: "Pre-placement briefing", text: "Students shortlisted for the next drive should attend the briefing.", date: "24 Sep 2026", type: "Important" },
  { title: "Resume review window", text: "Update your profile and resume before the next recruiter shortlist.", date: "22 Sep 2026", type: "Reminder" }
];
