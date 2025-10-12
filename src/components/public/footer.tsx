/* import { motion } from "framer-motion" */
import Link from "next/link"
import { Facebook, Instagram, Twitter /* Codesandbox */ } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa";
/* const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
} */

export function Footer() {
  return (<>
    <footer className="margin-web w-full border-t bg-background">
      <div className="container pt-8 md:pt-10 px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Imobiliária Sistema</h3>
            <p className="text-sm text-muted-foreground">CRECI 00.09180</p>
            <p className="text-sm text-muted-foreground">Encontrar o imóvel dos seus sonhos está a apenas um clique de distância.</p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100086704509567"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>

              <a
                href="https://www.instagram.com/Sistemaimobiliariavga/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>

              <a
                href="https://wa.me/Sistema"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <FaWhatsapp className="h-5 w-5" />
              </a>

            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold">Acesso Rápido</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="text-muted-foreground hover:text-primary">
                  Imóveis
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-primary">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-primary">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade#cookies" className="text-muted-foreground hover:text-primary">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold">Entre em contato</h3>
            <address className="not-italic text-sm text-muted-foreground">
              <p>Pingo, 22 Pingo</p>
              <p>Varginha - MG, 00000-000</p>
              <p className="mt-2">Email: pingo@gmail.com</p>
              <p>Telefone: (00) 0000-0000</p>
            </address>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6">
        <div className="mt-8 md:my-5 border-t pt-6 text-center text-sm text-muted-foreground"> {/*md:mt-10 */}
          <p>&copy; {new Date().getFullYear()} Imobiliária Sistema. Todos os direitos reservados.</p>
        </div>
        
        {/* <div className="border-t text-center text-sm text-muted-foreground">
            <motion.div
              className="flex flex-row items-center bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg relative overflow-hidden"
              initial="initial"
              whileHover="hover">
              <div className="flex items-center gap-2 relative z-10 mx-auto">
                <motion.div className="relative">
                  <motion.div
                    className="block rounded-xl overflow-visible group relative"
                    whileHover="hover"
                    initial="initial">
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      variants={glowVariants}
                      style={{
                        background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
                        opacity: 0,
                        borderRadius: "16px",
                      }}/>
                    <motion.a href="http://github.com/pingo700" className="flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-muted-foreground group-hover:text-foreground transition-colors rounded-xl">
                      <span className="transition-colors duration-300 group-hover:text-blue-500 text-foreground">
                        <Codesandbox className="h-5 w-5" />
                      </span>
                      <span className="">Desenvolvido por TechBox</span>
                    </motion.a>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
        </div> */}
        </div>
      </div>
    </footer>
  </>
  )
}