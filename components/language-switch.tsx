import { useState, type FC } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { languages } from "content/languages/languages";
import { motion, type Variants } from "framer-motion";
import { useTranslation } from "next-i18next";

type activeLanguage =
  | { name: string; icon: string; locale: string }
  | undefined;

const LanguageSwitch: FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menuItemVariants: Variants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
      display: "block",
    },
    closed: {
      y: -50,
      opacity: 0,
      transition: {
        duration: 0.4,
      },
      transitionEnd: {
        display: "none",
      },
    },
  };

  const getActiveLanguage = (): activeLanguage =>
    languages.filter((item) => item.locale === router.locale)[0];

  const getAllAvailableLanguages = (): languages =>
    languages.filter((item) => item.locale !== router.locale);

  const toggleOpenMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div className="language-switch" onClick={toggleOpenMenu}>
      <div className={`language is-icon${isOpen ? " open" : ""}`}>
        <Image
          src={`/${getActiveLanguage()!.icon}`}
          sizes="100vw"
          width={50}
          height={50}
          alt="Language image"
        />
        <span>{t(getActiveLanguage()!.name)}</span>
      </div>
      <motion.div
        className="sub-menu"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={menuItemVariants}
      >
        {getAllAvailableLanguages().map((item, index) => (
          <Link
            href={{
              pathname: router.pathname,
              query: router.query,
            }}
            locale={item.locale}
            key={index}
          >
            <div className="language">
              <Image
                src={`/${item.icon}`}
                sizes="100vw"
                width={50}
                height={50}
                alt="Language image"
              />
              <span>{t(item.name)}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default LanguageSwitch;
