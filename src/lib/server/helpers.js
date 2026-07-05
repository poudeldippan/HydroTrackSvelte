export function getSCurveData(components) {
    if (!components || components.length === 0) {
        return { planned: [], actual: [] };
    }

    const plannedStarts = components.map(c => new Date(c.plannedStart).getTime());
    const plannedEnds = components.map(c => new Date(c.plannedEnd).getTime());
    const minStart = new Date(Math.min(...plannedStarts));
    const maxEnd = new Date(Math.max(...plannedEnds));

    // Generate monthly dates
    const months = [];
    let current = new Date(minStart.getFullYear(), minStart.getMonth(), 1);
    const end = new Date(maxEnd.getFullYear(), maxEnd.getMonth(), 1);

    while (current <= end) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    const totalMonths = months.length;
    const plannedCurve = [];
    const actualCurve = [];
    const today = new Date();
    const currentYearMonth = today.getFullYear() * 12 + today.getMonth();

    // S-Curve calculation: Sigmoid function for Planned progress
    for (let i = 0; i < totalMonths; i++) {
        const date = months[i];
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        let plannedVal = 0;
        if (totalMonths > 1) {
            const fraction = i / (totalMonths - 1);
            const z = (fraction - 0.5) * 6; // goes from -3 to +3
            plannedVal = 100 / (1 + Math.exp(-z));
            if (i === 0) plannedVal = 0;
            if (i === totalMonths - 1) plannedVal = 100;
        } else {
            plannedVal = 100;
        }

        plannedCurve.push({
            x: monthName,
            y: Math.round(plannedVal * 10) / 10
        });

        const monthYearMonth = date.getFullYear() * 12 + date.getMonth();
        if (monthYearMonth <= currentYearMonth) {
            let overallProgress = 0;
            const totalWeight = components.reduce((acc, c) => acc + c.weightPct, 0);
            if (totalWeight > 0) {
                components.forEach(c => {
                    overallProgress += (c.actualProgress * c.weightPct) / totalWeight;
                });
            }

            let elapsedMonthsCount = 0;
            months.forEach(m => {
                const mYearMonth = m.getFullYear() * 12 + m.getMonth();
                if (mYearMonth <= currentYearMonth) {
                    elapsedMonthsCount++;
                }
            });

            let actualVal = 0;
            if (elapsedMonthsCount > 1 && i < elapsedMonthsCount) {
                const frac = i / (elapsedMonthsCount - 1);
                actualVal = overallProgress * frac;
                // Add minor fluctuation mock-ups to mimic Laravel's rand(-2, 2)
                if (i > 0 && i < elapsedMonthsCount - 1) {
                    actualVal += (Math.sin(i) * 2); // pseudo-random fluctuation
                    if (actualVal < 0) actualVal = 0;
                    if (actualVal > overallProgress) actualVal = overallProgress;
                }
            } else if (i === 0) {
                actualVal = 0;
            } else {
                actualVal = overallProgress;
            }

            actualCurve.push({
                x: monthName,
                y: Math.round(actualVal * 10) / 10
            });
        }
    }

    return {
        planned: plannedCurve,
        actual: actualCurve
    };
}
