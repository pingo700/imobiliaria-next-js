import { motion } from "framer-motion"
/* import { Codesandbox } from "lucide-react"
 */
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

export function FooterAdmin() {
  return (<>
    <footer className="margin-web w-full border-t bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col justify-between">
          <div className="mt-8 md:my-5 text-center text-sm text-muted-foreground"> {/*md:mt-10 */}
            <p>&copy; {new Date().getFullYear()} Imobiliária Sistema. Todos os direitos reservados.</p>
          </div>

          {/* <div className="text-center text-sm text-muted-foreground">
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