import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>52</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>4</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>12</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
