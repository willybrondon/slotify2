# Parcel Analytics for InPost/Mondial Relais

A comprehensive PySpark solution for analyzing parcel delivery data from APM (Automated Parcel Machines) events. This solution processes near-real-time parcel event data and creates downstream summary tables for daily, weekly, and quarterly analysis.

## Overview

This solution processes a Delta table containing parcel events with approximately 10 million rows per day. It focuses on the `ParcelStoredForDeliveryByCourier` event type and creates aggregated summaries grouped by APM ID and courier ID.

## Features

### 📊 **Multi-level Analytics**
- **Daily summaries**: Parcel delivery counts per APM, courier, and date
- **Weekly summaries**: Aggregated weekly delivery statistics
- **Quarterly summaries**: Long-term quarterly performance metrics
- **APM-level summaries**: Overall APM performance across all couriers

### 🔄 **Processing Modes**
- **Batch processing**: Process historical data with date range filtering
- **Stream processing**: Real-time processing using Spark Structured Streaming
- **Incremental processing**: Support for append/merge operations

### 📈 **Performance Optimizations**
- Delta Lake optimizations (auto-optimize, auto-compact)
- Adaptive query execution
- Partition management and vacuum operations
- Efficient APM ID extraction from location identifiers

### 🎯 **Analytics Views**
- Top performing APMs
- Courier efficiency metrics
- Daily and weekly trends
- Performance benchmarking

## Data Schema

### Source Table Schema
```sql
CREATE TABLE parcel_events (
    parcel_id BIGINT NOT NULL,
    event_date_time TIMESTAMP NOT NULL,  -- UTC timestamp
    event_date DATE NOT NULL,            -- Local timezone date
    event_name STRING NOT NULL,          -- e.g., 'ParcelStoredForDeliveryByCourier'
    location_id STRING NOT NULL,         -- e.g., 'APM_FR_123'
    courier_id BIGINT                    -- NULL for non-delivery events
)
```

### Output Tables

#### 1. Daily Summary (`daily_parcel_delivery_summary`)
```sql
apm_id, courier_id, event_date, year, month, day, day_of_week, day_name,
parcels_stored_for_delivery, unique_parcels
```

#### 2. Weekly Summary (`weekly_parcel_delivery_summary`)
```sql
apm_id, courier_id, year_week, week_start, week_end,
parcels_stored_for_delivery, unique_parcels
```

#### 3. Quarterly Summary (`quarterly_parcel_delivery_summary`)
```sql
apm_id, courier_id, year_quarter, year, quarter,
parcels_stored_for_delivery, unique_parcels
```

#### 4. APM Summary (`apm_delivery_summary`)
```sql
apm_id, event_date, year, month, day,
total_parcels_stored, unique_parcels, unique_couriers
```

## Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Spark Environment**
   ```bash
   export SPARK_HOME=/path/to/spark
   export PYTHONPATH=$SPARK_HOME/python:$PYTHONPATH
   ```

3. **Set up Delta Lake**
   Ensure Delta Lake is properly configured in your Spark environment.

## Usage

### Basic Usage

```python
from parcel_analytics import ParcelAnalyticsProcessor

# Initialize processor
processor = ParcelAnalyticsProcessor()

# Batch processing for last 30 days
daily, weekly, quarterly, apm = processor.batch_process_parcel_analytics(
    start_date="2024-01-01",
    end_date="2024-01-31"
)

# Get performance metrics
apm_metrics = processor.get_apm_performance_metrics(30)
courier_metrics = processor.get_courier_performance_metrics(30)

# Create analytics views
processor.create_analytics_views()

# Optimize tables
processor.optimize_tables()

# Close session
processor.close()
```

### Stream Processing

```python
# Start stream processing
query = processor.stream_process_parcel_analytics()

# Monitor the stream
query.awaitTermination()
```

### Advanced Queries

```python
# Get daily trends
daily_trends = processor.get_daily_trends(30)

# Get weekly trends
weekly_trends = processor.get_weekly_trends(12)

# Custom SQL queries
recent_data = processor.spark.sql("""
    SELECT * FROM daily_parcel_delivery_summary 
    WHERE event_date >= current_date() - INTERVAL 7 days
    ORDER BY event_date DESC, parcels_stored_for_delivery DESC
""")
```

## Key Features Explained

### 1. APM ID Extraction
The solution automatically extracts APM IDs from location identifiers:
- Input: `APM_FR_123` → Output: `123`
- Handles various location ID formats gracefully

### 2. Event Filtering
Focuses on `ParcelStoredForDeliveryByCourier` events where:
- `courier_id` is not null
- `apm_id` is successfully extracted
- Events are unique per parcel

### 3. Aggregation Strategy
- **Count**: Total number of delivery events
- **Count Distinct**: Unique parcels delivered
- **Grouping**: By APM ID, courier ID, and time periods

### 4. Performance Optimizations
- **Delta Lake**: ACID transactions and schema evolution
- **Auto-optimize**: Automatic file compaction
- **Partitioning**: Efficient date-based partitioning
- **Caching**: Strategic data caching for repeated queries

## Analytics Views

### 1. `recent_daily_deliveries`
Recent 30 days of daily delivery data for quick access.

### 2. `top_performing_apms`
APMs with >100 total parcels in last 30 days, ranked by performance.

### 3. `courier_efficiency`
Couriers with >50 total parcels, including efficiency metrics.

## Monitoring and Maintenance

### Table Optimization
```python
# Optimize all tables
processor.optimize_tables()
```

### Data Quality Checks
```python
# Check for data completeness
missing_data = processor.spark.sql("""
    SELECT event_date, COUNT(*) as event_count
    FROM parcel_events
    WHERE event_name = 'ParcelStoredForDeliveryByCourier'
    GROUP BY event_date
    HAVING event_count = 0
    ORDER BY event_date DESC
""")
```

### Performance Monitoring
```python
# Monitor query performance
processor.spark.sql("SET spark.sql.adaptive.enabled=true")
processor.spark.sql("SET spark.sql.adaptive.coalescePartitions.enabled=true")
```

## Configuration

### Spark Configuration
```python
spark = SparkSession.builder \
    .appName("ParcelDeliveryAnalytics") \
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .config("spark.sql.adaptive.enabled", "true") \
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
    .config("spark.sql.adaptive.skewJoin.enabled", "true") \
    .getOrCreate()
```

### Delta Lake Configuration
```python
# Auto-optimize settings
.option("delta.autoOptimize.optimizeWrite", "true") \
.option("delta.autoOptimize.autoCompact", "true")
```

## Error Handling

The solution includes comprehensive error handling:
- Invalid date ranges
- Missing or malformed data
- Connection issues
- Schema evolution support

## Scaling Considerations

### For Large Datasets
- Use appropriate partition sizes
- Implement data retention policies
- Consider incremental processing
- Monitor memory usage

### For High Volume
- Tune Spark configurations
- Use appropriate cluster sizing
- Implement checkpointing for streams
- Monitor processing latency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Check the documentation
- Review example usage
- Open an issue for bugs
- Contact the development team

---

**Note**: This solution is designed for InPost/Mondial Relais APM data and may require adjustments for other parcel delivery systems.

