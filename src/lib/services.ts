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
    name: "Homelab (Public)",
    services: [
      { name: "Homelab Wiki", url: "https://homelab.aneeshmaganti.com" },
      { name: "Pelican", url: "https://pelican.aneeshmaganti.com" },
    ],
  },
  {
    name: "Homelab (Private)",
    services: [
      { name: "FreshRSS", url: "https://rss.aneeshmaganti.com" },
      { name: "Headlamp", url: "https://headlamp.aneeshmaganti.com" },
      { name: "Romm", url: "https://romm.aneeshmaganti.com" },
      { name: "The Lounge", url: "https://thelounge.aneeshmaganti.com" },
    ],
  },
  {
    name: "GitHub Pages",
    statusLink: "https://www.githubstatus.com",
    services: [
      { name: "Homepage", url: "https://aneeshmaganti.com" },
      { name: "Blog", url: "https://stalereference.com" },
      { name: "Emptypad", url: "https://emptypad.aneeshmaganti.com" },
      { name: "Notes", url: "https://notes.aneeshmaganti.com" },
    ],
  },
  {
    name: "Cloudlab",
    statusLink: "https://status.digitalocean.com",
    services: [
      { name: "CTFd", url: "https://recruit.aneeshmaganti.com" },
      { name: "Status", url: "https://status.aneeshmaganti.com" },
    ],
  },
];
