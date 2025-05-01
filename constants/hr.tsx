import { ColumnConfig } from "@/app/types/column";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Phone,
  User,
  Calendar,
  Star,
  Code,
  ShoppingCart,
  Megaphone,
  Users,
  Check,
  Building,
} from "lucide-react";

export interface HRRow {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  phone: string;
  age: number | null;
  birthDate: Date | null;
  department: string | null;
  skills: string[] | null;
  test_rating: number | null;
  // isFeatured: boolean;
  // agreedToTerms: boolean;
  readyToHire: boolean;
}

export const hrColumns: ColumnConfig<HRRow>[] = [
  {
    icon: <User size={16} />,
    id: "firstName",
    header: "First Name",
    type: "custom",
    isEditable: false,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={row.image} />
          <AvatarFallback>{row.firstName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      </div>
    ),
    minWidth: 400,
    maxWidth: 600,
  },

  {
    icon: <Phone size={16} />,
    id: "phone",
    header: "Phone",
    type: "text",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">
        <Phone />
        {row.phone}
      </p>
    ),
    minWidth: 400,
    maxWidth: 600,
  },
  {
    icon: <Calendar size={16} />,
    id: "age",
    header: "Age",
    type: "number",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">
        <Calendar />
        {row.age}
      </p>
    ),
    minWidth: 300,
    maxWidth: 400,
  },
  {
    id: "birthDate",
    header: "Birth Date",
    type: "date",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">
        <Calendar />
        {row.birthDate?.toLocaleDateString()}
      </p>
    ),
    isSortable: true,
    minWidth: 300,
    maxWidth: 400,
  },
  {
    icon: <Check size={16} />,
    id: "readyToHire",
    header: "Ready to Hire",
    type: "checkbox",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">{row.readyToHire ? "Yes" : "No"}</p>
    ),
    minWidth: 300,
    maxWidth: 400,
  },
  {
    icon: <Star size={16} />,
    id: "test_rating",
    header: "Test Rating",
    type: "rating",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">
        <Star />
        {row.test_rating}
      </p>
    ),
    minWidth: 300,
    maxWidth: 600,
  },
  {
    icon: <Building size={16} />,
    id: "department",
    header: "Department",
    type: "select",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => <p className="text-sm font-medium">{row.department}</p>,
    selectOptions: [
      { label: "Engineering", value: "engineering", icon: <Code /> },
      { label: "Sales", value: "sales", icon: <ShoppingCart /> },
      { label: "Marketing", value: "marketing", icon: <Megaphone /> },
      { label: "HR", value: "hr", icon: <Users /> },
    ],
    minWidth: 400,
    maxWidth: 800,
  },
  {
    icon: <Code size={16} />,
    id: "skills",
    header: "Skills",
    type: "multi-select",
    isEditable: true,
    isDeletable: false,
    isDraggable: true,
    isResizable: true,
    cell: (row) => (
      <p className="text-sm font-medium">{row.skills?.join(", ")}</p>
    ),
    multiSelectOptions: [
      { label: "JavaScript", value: "javascript", icon: <Code /> },
      { label: "React", value: "react", icon: <Code /> },
      { label: "CSS", value: "css", icon: <Code /> },
      { label: "HTML", value: "html", icon: <Code /> },
      { label: "Python", value: "python", icon: <Code /> },
      { label: "SQL", value: "sql", icon: <Code /> },
      { label: "Docker", value: "docker", icon: <Code /> },
      { label: "Git", value: "git", icon: <Code /> },
    ],
    minWidth: 400,
    maxWidth: 800,
  },
];

export const hrData: HRRow[] = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Smith",
    image: "https://i.pravatar.cc/150?img=1",
    phone: "555-123-4567",
    age: 28,
    birthDate: new Date(1996, 5, 15),
    department: "engineering",
    skills: ["javascript", "react", "css"],
    test_rating: 4,
    readyToHire: true,
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Johnson",
    image: "https://i.pravatar.cc/150?img=2",
    phone: "555-987-6543",
    age: 34,
    birthDate: new Date(1990, 2, 22),
    department: "sales",
    skills: ["sql"],
    test_rating: 5,
    readyToHire: false,
  },
  {
    id: 3,
    firstName: "Charlie",
    lastName: "Williams",
    image: "https://i.pravatar.cc/150?img=3",
    phone: "555-111-2222",
    age: null,
    birthDate: null,
    department: "marketing",
    skills: ["html", "css"],
    test_rating: 3,
    readyToHire: true,
  },
  {
    id: 4,
    firstName: "Diana",
    lastName: "Brown",
    image: "https://i.pravatar.cc/150?img=4",
    phone: "555-333-4444",
    age: 45,
    birthDate: new Date(1979, 10, 1),
    department: "hr",
    skills: null,
    test_rating: null,
    readyToHire: false,
  },
  {
    id: 5,
    firstName: "Ethan",
    lastName: "Jones",
    image: "https://i.pravatar.cc/150?img=5",
    phone: "555-555-5555",
    age: 22,
    birthDate: new Date(2002, 8, 10),
    department: "engineering",
    skills: ["python", "docker", "git"],
    test_rating: 5,
    readyToHire: true,
  },
  {
    id: 6,
    firstName: "Fiona",
    lastName: "Garcia",
    image: "https://i.pravatar.cc/150?img=6",
    phone: "555-666-7777",
    age: 30,
    birthDate: new Date(1994, 1, 28),
    department: null,
    skills: ["react", "git"],
    test_rating: 4,
    readyToHire: true,
  },
  {
    id: 7,
    firstName: "George",
    lastName: "Miller",
    image: "https://i.pravatar.cc/150?img=7",
    phone: "555-777-8888",
    age: 51,
    birthDate: new Date(1973, 4, 12),
    department: "sales",
    skills: [],
    test_rating: 2,
    readyToHire: false,
  },
  {
    id: 8,
    firstName: "Hannah",
    lastName: "Davis",
    image: "https://i.pravatar.cc/150?img=8",
    phone: "555-888-9999",
    age: 29,
    birthDate: new Date(1995, 7, 19),
    department: "engineering",
    skills: ["javascript", "python", "sql", "docker"],
    test_rating: 5,
    readyToHire: true,
  },
  {
    id: 9,
    firstName: "Ian",
    lastName: "Rodriguez",
    image: "https://i.pravatar.cc/150?img=9",
    phone: "555-999-0000",
    age: 38,
    birthDate: new Date(1986, 3, 5),
    department: "marketing",
    skills: ["css"],
    test_rating: 3,
    readyToHire: false,
  },
  {
    id: 10,
    firstName: "Jane",
    lastName: "Martinez",
    image: "https://i.pravatar.cc/150?img=10",
    phone: "555-000-1111",
    age: 25,
    birthDate: new Date(1999, 9, 30),
    department: "engineering",
    skills: ["react", "html", "git"],
    test_rating: 4,
    readyToHire: true,
  },
];
