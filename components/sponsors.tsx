import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Sponsors() {
  return (
    <div className="space-y-6">
      <p className="text-center text-lg">
        Shoutout to our amazing sponsors who make TillyHacks possible!
        <br />
        Want to sponsor us? Check out our{" "}
        <Link href="/prospectus.pdf" className="text-primary hover:underline">
          prospectus
        </Link>
        .
      </p>

      <div className="flex flex-wrap justify-center items-center gap-8">
        <div className="text-center p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <p className="text-muted-foreground">Your logo could be here</p>
          <p className="text-sm text-muted-foreground mt-2">(seriously, please email us)</p>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="mb-4 text-lg">Want to help out?</p>
          <Button size="lg">Donate Now</Button>
        </Link>
      </div>
    </div>
  )
}
