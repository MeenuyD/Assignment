document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function parseTime(timeStr) {
    // Function to parse time string into Date object
    return new Date(timeStr);
}

function analyzeTimesheet(sheet) {
    let currentEmployee = null;
    let consecutiveDays = 0;
    let lastOutTime = null;
    let lastDate = null;

    sheet.forEach(row => {
        const { Position: position, Status: status, Time: timeIn, 'Time Out': timeOut, 'Timecard Hours (as Time)': timecardHours, 'Employee Name': employeeName } = row;

        // Check if the employee has worked for 7 consecutive days
        if (currentEmployee === employeeName) {
            const currentDate = new Date(timeIn).setHours(0, 0, 0, 0);

            if (lastDate && currentDate - lastDate === 86400000) {
                consecutiveDays += 1;
            } else {
                consecutiveDays = 0;
            }
        } else {
            currentEmployee = employeeName;
            lastDate = new Date(timeIn).setHours(0, 0, 0, 0);
            consecutiveDays = 0;
        }

        // Check for less than 10 hours between shifts but greater than 1 hour
        if (lastOutTime) {
            const timeInDt = new Date(timeIn);
            const lastOutTimeDt = new Date(lastOutTime);
            const timeDiff = (timeInDt - lastOutTimeDt) / (1000 * 60 * 60); // Convert to hours

            if (1 < timeDiff && timeDiff < 10) {
                console.log(`${employeeName} has less than 10 hours between shifts (but more than 1 hour) on ${timeIn}. Position: active`);
            }
        }

        lastOutTime = timeOut;

        // Checking for more than 14 hours in a single shift
        if (parseFloat(timecardHours) > 14) {
            console.log(`${employeeName} has worked for more than 14 hours in a single shift on ${timeIn}. Position: active`);
        }

        // Checking if the employee has worked for 7 consecutive days
        if (consecutiveDays === 6) {
            console.log(`${employeeName} has worked for 7 consecutive days. Position: Active`);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const csvData = e.target.result;
            Papa.parse(csvData, {
                complete: function (results) {
                    analyzeTimesheet(results.data);
                },
                header: true
            });
        };

        reader.readAsText(file);
    }
}
