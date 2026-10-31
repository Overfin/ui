// A panel's menu, for <Shell nav={…} />.
export interface NavItem {
  href: string;
  label: string;
  /** icon: the d of each path of a 24×24 icon. */
  icon?: string[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}
