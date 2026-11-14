# Scientific Methods & Statistical Formulations

This document describes the exact mathematical formulas, statistical tests, assumptions, and computational implementations used in **The Earth Science Autopilot**.

---

## 1. Mann-Kendall Non-Parametric Trend Test

The Mann-Kendall test is a rank-based, non-parametric test used to assess whether there is a monotonic upward or downward trend in a time-series variable over time.

### S-Statistic
Given a time series $x_1, x_2, \dots, x_n$:
$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$$

Where:
$$\text{sgn}(\theta) = \begin{cases} +1 & \text{if } \theta > 0 \\ 0 & \text{if } \theta = 0 \\ -1 & \text{if } \theta < 0 \end{cases}$$

### Variance with Tied Values Adjustment
When duplicate observations (ties) occur in the data, the variance of $S$ is adjusted:
$$\text{Var}(S) = \frac{n(n-1)(2n+5) - \sum_{i=1}^g t_i(t_i-1)(2t_i+5)}{18}$$

Where:
- $g$ is the number of tied groups.
- $t_i$ is the number of tied observations in the $i$-th group.

### Standardized Test Statistic ($Z$)
$$Z = \begin{cases} \frac{S - 1}{\sqrt{\text{Var}(S)}} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sqrt{\text{Var}(S)}} & \text{if } S < 0 \end{cases}$$

### Two-Tailed p-Value
The two-tailed p-value is calculated from the Standard Normal Cumulative Distribution Function $\Phi(Z)$:
$$p = 2 \times (1 - \Phi(|Z|))$$

If $p < \alpha$ (default $\alpha = 0.05$):
- $S > 0 \implies$ Statistically significant **increasing** monotonic trend.
- $S < 0 \implies$ Statistically significant **decreasing** monotonic trend.
- $p \ge \alpha \implies$ **No statistically significant trend detected**.

---

## 2. Sen's Robust Non-Parametric Slope Estimator

The Sen (Theil-Sen) slope is calculated as the median of all pairwise slopes:
$$Q_{ij} = \frac{x_j - x_i}{t_j - t_i} \quad \text{for all } 1 \le i < j \le n$$

$$\text{Sen's Slope} = \text{median}(Q)$$

**Advantage over OLS:** Sen's slope is resistant to gross measurement outliers and seasonal anomalies, with a breakdown point of approximately 29.3%.

---

## 3. Ordinary Least Squares (OLS) Linear Regression

Fits a linear model $y = \beta_1 x + \beta_0$ by minimizing the sum of squared residuals:
$$\beta_1 = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sum (x_i - \bar{x})^2}$$
$$\beta_0 = \bar{y} - \beta_1 \bar{x}$$
$$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$

---

## 4. Methodological Assumptions & Limitations

1. **Independence:** The basic Mann-Kendall test assumes independent observations. Strong positive first-order autocorrelation ($\rho_1 > 0.1$) can inflate type I error rates (false alarms).
2. **Causality:** Statistical significance proves only that an observed change is mathematically distinct from random variation within the sample window; it does not identify specific causal mechanisms without controlled physical modeling.
3. **Data Completeness:** The pipeline requires a minimum of 4 valid observations, and monthly/annual aggregations enforce an 85% completeness threshold.

