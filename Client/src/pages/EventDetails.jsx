import { Chart } from "react-google-charts";
import { Button, Card } from "flowbite-react";

export default function EventDetails() {
  const data = [
    ["Task", "Hours per Day"],
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7], // CSS-style declaration
  ];

  const options = {
    pieHole: 0.4,
    is3D: false,
    backgroundColor: { fill: "transparent" },
  };

  return (
    <div className=" h-screen flex flex-col">
      <h1 className=" p-4 text-xl font-bold">Event Name</h1>

      {/* First area */}
      <Card className=" p-4">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Details
        </h5>
        <p>Details for Area 1</p>
      </Card>
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Second area */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tasks
          </h5>
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={data}
            options={options}
          />
          <Button>Go to Tasks</Button>
        </Card>

        {/* Third area */}
        <Card className=" p-4">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tasks
          </h5>
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={data}
            options={options}
          />
          <Button>Go to Tasks</Button>
        </Card>
      </div>
    </div>
  );
}
