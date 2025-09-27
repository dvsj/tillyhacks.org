import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="font-bold">
            <span className="text-primary">Tilly</span>Hacks
          </span>
        </div>
        <p className="text-muted-foreground mb-4">
          &copy; {new Date().getFullYear()} tillyhacks
        </p>
        <div className="flex justify-center space-x-6 text-sm">
          <Link href="mailto:hello@tillyhacks.org" className="text-muted-foreground hover:text-primary">
            contact us
          </Link>
        </div>
      </div>
    </footer>
  )
}
