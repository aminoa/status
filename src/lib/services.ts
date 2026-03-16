export interface ServiceConfig {
  name: string;
  url: string;
}

export interface GroupConfig {
  name: string;
  statusLink?: string;
  services: ServiceConfig[];
}

export interface Service extends ServiceConfig {
  status: "up" | "down" | "checking";
  responseTime?: number;
}

export interface ServiceGroup {
  name: string;
  statusLink?: string;
  services: Service[];
}

export const SERVICE_GROUPS: GroupConfig[] = [
  {
    name: "Homelab",
    services: [
      { name: "CTFd", url: "https://recruit.aneeshmaganti.com" },
      { name: "DAC", url: "https://dac.aneeshmaganti.com" },
      { name: "Emptypad", url: "https://emptypad.aneeshmaganti.com" },
      { name: "Homelab Wiki", url: "https://homelab.aneeshmaganti.com" },
      { name: "Shi-kara-jinsei-ga-kuru", url: "https://shi-kara-jinsei-ga-kuru.aneeshmaganti.com" },
      { name: "Status", url: "https://status.aneeshmaganti.com" },

    ],
  },
  {
    name: "GitHub Pages",
    statusLink: "https://www.githubstatus.com",
    services: [
      { name: "Homepage", url: "https://aneeshmaganti.com" },
      { name: "Blog", url: "https://stalereference.com" },
      { name: "Notes", url: "https://notes.aneeshmaganti.com" },
    ],
  },
  {
    name: "Friends' Websites",
    services: [
      { name: "Thaison Le", url: "https://www.lethaison.com/" },
      { name: "Sachin Iyer", url: "https://www.sachiniyer.com"},
    ],
  },
];
