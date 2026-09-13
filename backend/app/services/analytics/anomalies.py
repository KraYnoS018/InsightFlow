"""
Deterministic Statistical Anomaly Detector
-------------------------------------------
Method: Z-score & Interquartile Range (IQR) on time-series aggregated revenue.
For each period:
- Calculates historical mean and standard deviation.
- Flags periods where deviation exceeds threshold (|z| >= 2.0 or outside 1.5 * IQR).
- Categorizes severity:
    - 'high': |z| >= 3.0 or extreme outlier (> 3 * IQR)
    - 'medium': 2.0 <= |z| < 3.0
- Generates objective, transparent explanations without subjective assumptions.
"""

from typing import List
import numpy as np
import pandas as pd
from app.schemas.analytics import AnomalyItem, TimeSeriesPoint


def detect_revenue_anomalies(time_series: List[TimeSeriesPoint]) -> List[AnomalyItem]:
    if len(time_series) < 4:
        # Insufficient data points to establish a reliable statistical baseline
        return []

    revenues = [point.revenue for point in time_series]
    mean_rev = float(np.mean(revenues))
    std_rev = float(np.std(revenues))

    q25, q75 = np.percentile(revenues, [25, 75])
    iqr = q75 - q25
    lower_bound = q25 - 1.5 * iqr
    upper_bound = q75 + 1.5 * iqr

    anomalies: List[AnomalyItem] = []

    for point in time_series:
        val = point.revenue
        is_anomaly = False
        z_score = 0.0

        if std_rev > 0:
            z_score = (val - mean_rev) / std_rev
            if abs(z_score) >= 2.0:
                is_anomaly = True
        elif iqr > 0 and (val < lower_bound or val > upper_bound):
            is_anomaly = True

        if is_anomaly:
            severity = "high" if abs(z_score) >= 3.0 or val > (q75 + 3 * iqr) or val < (q25 - 3 * iqr) else "medium"
            
            if val > mean_rev:
                reason = f"Revenue is unusually high compared with the historical baseline (z-score: {round(z_score, 2)})."
            else:
                reason = f"Revenue is unusually low compared with the historical baseline (z-score: {round(z_score, 2)})."

            anomalies.append(
                AnomalyItem(
                    period=point.period,
                    metric="revenue",
                    value=round(val, 2),
                    expected=round(mean_rev, 2),
                    severity=severity,
                    reason=reason,
                )
            )

    return anomalies
