import { createNavigation } from "next-intl/navigation";
import { routing } from "@/libs/I18nRouting";

export const { Link, usePathname } = createNavigation(routing);
