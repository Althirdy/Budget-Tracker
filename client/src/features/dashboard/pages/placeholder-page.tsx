import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>This workspace is part of the next Budget Tracker milestone.</CardDescription>
      </CardHeader>
      <CardContent className="grid min-h-64 place-items-center border-t text-sm text-muted-foreground">
        Coming soon
      </CardContent>
    </Card>
  )
}
