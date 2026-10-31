import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import textDisabledFieldStyles from "../../../mui_styles/TextDisableFieldStyles";

const userRoles = [
    // Executive & Admin
    "Super Admin", "Admin", "CEO", "CTO", "CFO", "COO", "President", "Vice President", "Managing Director",
  
    // Department Heads
    "HR Manager", "IT Manager", "Finance Manager", "Sales Manager", "Marketing Manager", "Production Manager",
    "Maintenance Head", "Logistics Head", "Purchase Manager", "R&D Head", "Security Head",
  
    // Operations & Floor
    "Factory Supervisor", "Machine Operator", "Quality Inspector", "Line Supervisor", "Production Worker",
    "Warehouse Manager", "Inventory Controller", "Packaging Supervisor", "Store Keeper", "Delivery Coordinator",
  
    // Technical
    "Software Engineer", "DevOps Engineer", "QA Tester", "Backend Developer", "Frontend Developer",
    "Full Stack Developer", "System Administrator", "Network Engineer", "Database Admin", "IT Support",
  
    // Sales & Marketing
    "Sales Executive", "Sales Representative", "Marketing Executive", "Field Sales Agent", "Customer Support",
    "Telecaller", "Client Relationship Manager", "Social Media Manager", "Digital Marketing Analyst",
  
    // Finance & Accounts
    "Accountant", "Junior Accountant", "Billing Executive", "Auditor", "Payroll Manager", "Finance Analyst",
  
    // HR & Admin
    "HR Executive", "Recruiter", "Training Manager", "Receptionist", "Office Admin", "Compliance Officer",
  
    // Procurement & Logistics
    "Purchase Executive", "Vendor Manager", "Supply Chain Analyst", "Fleet Manager", "Logistics Executive",
  
    // R&D & Engineering
    "Product Developer", "Research Scientist", "Lab Technician", "Mechanical Engineer", "Electrical Engineer",
  
    // Security & Safety
    "Security Guard", "Safety Officer", "Fire Safety Inspector", "Emergency Responder",
  
    // Maintenance & Facility
    "Electrician", "Plumber", "HVAC Technician", "Maintenance Engineer", "Housekeeping",
  
    // Others / Custom Roles
    "Intern", "Trainee", "Consultant", "Freelancer", "Advisor", "External Auditor",
  
    // GALACTIC 🌌🛸
    "Galaxy Admin", "Nebula Strategist", "Timekeeper", "Quantum Coder", "Alien Language Translator", "Cyber Witch", "Dream Architect", "Warp Gate Engineer"
  ];
  
const ReusableUserRoleSelect = ({ selectedRole, setSelectedRole }) => {
  return (
    <FormControl sx={textDisabledFieldStyles} fullWidth margin="normal">
      <InputLabel>User Role</InputLabel>
      <Select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        label="User Role"
      >
        {userRoles.map((role, index) => (
          <MenuItem key={index} value={role}>
            {role}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ReusableUserRoleSelect;
