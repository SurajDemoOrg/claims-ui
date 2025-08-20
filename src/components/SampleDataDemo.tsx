import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';

// Sample claim data based on your requirements
const sampleClaimData = {
  'Participant Name': 'Deepanshu Yadav',
  'Social Security Number': '124421234',
  'Employer Name': 'WEX',
  'Employee ID': 'A1099',
  'Lists': [
    {
      'Plan Type': 'HRA',
      'Service Start Date': '08/02/2023',
      'Service End Date': '08/15/2024',
      'Provider': 'General Hospital',
      'Type of Service': 'Co-pay',
      'Out of Pocket Cost': 1000
    },
    {
      'Plan Type': 'FSA',
      'Service Start Date': '08/03/2025',
      'Service End Date': '08/12/2025',
      'Provider': 'General Hospital',
      'Type of Service': 'Eye',
      'Out of Pocket Cost': 500
    },
    {
      'Plan Type': 'FSA',
      'Service Start Date': '08/03/2025',
      'Service End Date': '08/11/2025',
      'Provider': 'City General Hospital',
      'Type of Service': 'Dental',
      'Out of Pocket Cost': 300
    }
  ],
  'Total Cost': 1800,
  'Service StartDate': '08/03/23',
  'Service EndDate': '08/13/25',
  'Provider Name': 'General Hospital',
  'Provider Signature': 'Soni, Surajz',
  'Day Care Cost': null
};

// Sample bill data based on your requirements
const sampleBillData = [
  {
    'provider_name': "St. Jude's Hospital",
    'patient_name': 'Jane Doe',
    'service_date': '09/15/2023',
    'total_cost': '$80.00',
    'filename': 'St_Jude_Hospital.jpg'
  },
  {
    'provider_name': 'Dr. Emily Carter / Harmony Health Systems',
    'patient_name': 'Jane Doe',
    'service_date': '2023-11-15',
    'total_cost': '$105.00',
    'filename': 'Harmony_Health_Systems.jpg'
  }
];

export function SampleDataDemo() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-4">Sample Claims Data Structure</h1>
        <p className="text-muted-foreground">
          This page demonstrates the updated claims and bill data structures with the new fields.
        </p>
      </div>

      <div className="space-y-8">
        {/* Claim Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Claim Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Participant Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold">Participant Name:</label>
                <p className="text-muted-foreground">{sampleClaimData['Participant Name']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Social Security Number:</label>
                <p className="text-muted-foreground">{sampleClaimData['Social Security Number']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Employer Name:</label>
                <p className="text-muted-foreground">{sampleClaimData['Employer Name']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Employee ID:</label>
                <p className="text-muted-foreground">{sampleClaimData['Employee ID']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Provider Name:</label>
                <p className="text-muted-foreground">{sampleClaimData['Provider Name']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Provider Signature:</label>
                <p className="text-muted-foreground">{sampleClaimData['Provider Signature']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Service Start Date:</label>
                <p className="text-muted-foreground">{sampleClaimData['Service StartDate']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Service End Date:</label>
                <p className="text-muted-foreground">{sampleClaimData['Service EndDate']}</p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Total Cost:</label>
                <p className="text-muted-foreground text-lg font-bold text-green-600">
                  ${sampleClaimData['Total Cost']}
                </p>
              </div>
              <div className="space-y-2">
                <label className="font-semibold">Day Care Cost:</label>
                <p className="text-muted-foreground">
                  {sampleClaimData['Day Care Cost'] || 'N/A'}
                </p>
              </div>
            </div>

            {/* Service Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleClaimData.Lists.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={item['Plan Type'] === 'HRA' ? 'default' : 'secondary'}>
                          {item['Plan Type']}
                        </Badge>
                      </TableCell>
                      <TableCell>{item['Service Start Date']}</TableCell>
                      <TableCell>{item['Service End Date']}</TableCell>
                      <TableCell>{item['Provider']}</TableCell>
                      <TableCell>{item['Type of Service']}</TableCell>
                      <TableCell className="font-semibold">
                        ${item['Out of Pocket Cost']}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Bill Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Bill Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Service Date</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Filename</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleBillData.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bill.provider_name}</TableCell>
                    <TableCell>{bill.patient_name}</TableCell>
                    <TableCell>{bill.service_date}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {bill.total_cost}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {bill.filename}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Data Structure Information */}
        <Card>
          <CardHeader>
            <CardTitle>Data Structure Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Claims Data Structure:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Participant Name, Social Security Number, Employer Name, Employee ID</li>
                <li>Lists: Array of service items with Plan Type, dates, provider, service type, and costs</li>
                <li>Total Cost: Sum of all service items</li>
                <li>Service dates range and provider information</li>
                <li>Optional fields: Provider Signature, Day Care Cost</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Bills Data Structure:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>provider_name: Name of the healthcare provider</li>
                <li>patient_name: Name of the patient</li>
                <li>service_date: Date when service was provided</li>
                <li>total_cost: Cost of the service (formatted as currency)</li>
                <li>filename: Name of the bill file/document</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
