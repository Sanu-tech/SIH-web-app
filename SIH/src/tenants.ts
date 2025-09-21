export interface Tenant {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
  };
}

export const TENANTS: { [key: string]: Tenant } = {
  // --- Top Global Universities (US & UK) ---
  'mit': {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    colors: { primary: '#A31F34', primaryDark: '#8A1B2C', secondary: '#8A8B8C', secondaryDark: '#707172' },
  },
  'stanford': {
    id: 'stanford',
    name: 'Stanford University',
    colors: { primary: '#B1040E', primaryDark: '#8C1515', secondary: '#5E5E5E', secondaryDark: '#4E4E4E' },
  },
  'harvard': {
    id: 'harvard',
    name: 'Harvard University',
    colors: { primary: '#C90016', primaryDark: '#A51C30', secondary: '#4D4F53', secondaryDark: '#3A3C3F' },
  },
  'caltech': {
    id: 'caltech',
    name: 'California Institute of Technology',
    colors: { primary: '#FF6F00', primaryDark: '#D85D00', secondary: '#5C6670', secondaryDark: '#454C54' },
  },
  'oxford': {
    id: 'oxford',
    name: 'University of Oxford',
    colors: { primary: '#002147', primaryDark: '#001A38', secondary: '#BC9B6A', secondaryDark: '#A98A5F' },
  },
  'cambridge': {
    id: 'cambridge',
    name: 'University of Cambridge',
    colors: { primary: '#0072CF', primaryDark: '#005BA7', secondary: '#1A1A1A', secondaryDark: '#000000' },
  },
  'ucla': {
    id: 'ucla',
    name: 'University of California, Los Angeles',
    colors: { primary: '#3284BF', primaryDark: '#2774AE', secondary: '#FFD100', secondaryDark: '#E0B800' },
  },
  'uchicago': {
    id: 'uchicago',
    name: 'University of Chicago',
    colors: { primary: '#800000', primaryDark: '#660000', secondary: '#767676', secondaryDark: '#5E5E5E' },
  },
  'nyu': {
    id: 'nyu',
    name: 'New York University',
    colors: { primary: '#57068C', primaryDark: '#450570', secondary: '#BDBDBD', secondaryDark: '#A6A6A6' },
  },
  
  // --- Top Global Universities (Rest of World) ---
  'ethzurich': {
    id: 'ethzurich',
    name: 'ETH Zurich',
    colors: { primary: '#0069B4', primaryDark: '#005592', secondary: '#7F7F7F', secondaryDark: '#666666' },
  },
  'utoronto': {
    id: 'utoronto',
    name: 'University of Toronto',
    colors: { primary: '#002A5C', primaryDark: '#001E41', secondary: '#B3A369', secondaryDark: '#A1925E' },
  },
  'unimelb': {
    id: 'unimelb',
    name: 'The University of Melbourne',
    colors: { primary: '#001D4C', primaryDark: '#001435', secondary: '#00B4D8', secondaryDark: '#00A2C1' },
  },
  'utokyo': {
    id: 'utokyo',
    name: 'The University of Tokyo',
    colors: { primary: '#00A5CD', primaryDark: '#0083A3', secondary: '#F9D616', secondaryDark: '#E0BF13' },
  },
  'tsinghua': {
    id: 'tsinghua',
    name: 'Tsinghua University',
    colors: { primary: '#740074', primaryDark: '#5B005B', secondary: '#CCCCCC', secondaryDark: '#B3B3B3' },
  },
  'tum': {
    id: 'tum',
    name: 'Technical University of Munich',
    colors: { primary: '#3070B3', primaryDark: '#26598F', secondary: '#A5A5A5', secondaryDark: '#8C8C8C' },
  },
  'nus': {
    id: 'nus',
    name: 'National University of Singapore',
    colors: { primary: '#003D7C', primaryDark: '#002F60', secondary: '#EF7C00', secondaryDark: '#D66E00' },
  },

  // --- West Bengal, India ---
  'iitkgp': {
    id: 'iitkgp',
    name: 'IIT Kharagpur',
    colors: { primary: '#4D90FE', primaryDark: '#357AE8', secondary: '#0C2340', secondaryDark: '#08172B' },
  },
  'jadavpur': {
    id: 'jadavpur',
    name: 'Jadavpur University',
    colors: { primary: '#9A0000', primaryDark: '#800000', secondary: '#FFC107', secondaryDark: '#E6B800' },
  },
  'calcuttauniv': {
    id: 'calcuttauniv',
    name: 'University of Calcutta',
    colors: { primary: '#0033A0', primaryDark: '#00287D', secondary: '#FDB813', secondaryDark: '#E6A611' },
  },
  'presidency': {
    id: 'presidency',
    name: 'Presidency University, Kolkata',
    colors: { primary: '#004B71', primaryDark: '#003B5C', secondary: '#DCDDDE', secondaryDark: '#C8C9CA' },
  },
  'iiest': {
    id: 'iiest',
    name: 'IIEST Shibpur',
    colors: { primary: '#7A2E46', primaryDark: '#6D2E46', secondary: '#C8A464', secondaryDark: '#B3935A' },
  },
  'nitdgp': {
    id: 'nitdgp',
    name: 'NIT Durgapur',
    colors: { primary: '#005792', primaryDark: '#003B5C', secondary: '#F26522', secondaryDark: '#D95A1E' },
  },

  // --- India (Other Regions) ---
  'iitb': {
    id: 'iitb',
    name: 'IIT Bombay',
    colors: { primary: '#005A9C', primaryDark: '#003A6C', secondary: '#00AEEF', secondaryDark: '#009CD6' },
  },
  'iitd': {
    id: 'iitd',
    name: 'IIT Delhi',
    colors: { primary: '#9E1B32', primaryDark: '#8B1F42', secondary: '#8D99AE', secondaryDark: '#79859A' },
  },
  'iisc': {
    id: 'iisc',
    name: 'IISc Bangalore',
    colors: { primary: '#006A4E', primaryDark: '#005A31', secondary: '#B8860B', secondaryDark: '#A3770A' },
  },
  'du': {
    id: 'du',
    name: 'University of Delhi',
    colors: { primary: '#B5202B', primaryDark: '#A62630', secondary: '#F4BE00', secondaryDark: '#DBAA00' },
  },
  'bits': {
    id: 'bits',
    name: 'BITS Pilani',
    colors: { primary: '#004C99', primaryDark: '#003366', secondary: '#CCCCCC', secondaryDark: '#B3B3B3' },
  },
  
  // --- Generic / Demo ---
  'default': {
      id: 'default',
      name: 'Presentify Demo',
      colors: { primary: '#0d6efd', primaryDark: '#0b5ed7', secondary: '#6c757d', secondaryDark: '#5c636a' },
  },
  'communitycollege': {
    id: 'communitycollege',
    name: 'Generic Community College',
    colors: { primary: '#008080', primaryDark: '#006666', secondary: '#6E6E6E', secondaryDark: '#555555' },
  },
  'stateuniversity': {
    id: 'stateuniversity',
    name: 'State University',
    colors: { primary: '#B22222', primaryDark: '#8B0000', secondary: '#FFD700', secondaryDark: '#D4AF37' },
  },
  'techinstitute': {
    id: 'techinstitute',
    name: 'Future Tech Institute',
    colors: { primary: '#1E90FF', primaryDark: '#104E8B', secondary: '#32CD32', secondaryDark: '#228B22' },
  },
  'artschool': {
    id: 'artschool',
    name: 'Creative Arts School',
    colors: { primary: '#9932CC', primaryDark: '#8B008B', secondary: '#FF69B4', secondaryDark: '#FF1493' },
  },
  'businessschool': {
    id: 'businessschool',
    name: 'International Business School',
    colors: { primary: '#000080', primaryDark: '#000059', secondary: '#C0C0C0', secondaryDark: '#A9A9A9' },
  },
  'medicalschool': {
    id: 'medicalschool',
    name: 'Healers Medical School',
    colors: { primary: '#2E8B57', primaryDark: '#1E5E38', secondary: '#F5F5DC', secondaryDark: '#D8D8BF' },
  },
  'onlineschool': {
    id: 'onlineschool',
    name: 'Global Online Academy',
    colors: { primary: '#4682B4', primaryDark: '#36668F', secondary: '#FF8C00', secondaryDark: '#D97700' },
  },
  'highschool': {
    id: 'highschool',
    name: 'Central High School',
    colors: { primary: '#800020', primaryDark: '#5D0017', secondary: '#F2C649', secondaryDark: '#D9B241' },
  },
};