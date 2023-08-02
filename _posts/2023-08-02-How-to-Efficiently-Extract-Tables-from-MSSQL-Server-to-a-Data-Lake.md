---
layout: post
title: "How To Efficiently Extract Tables From MSSQL Server To A Data Lake"
date: 2023-08-02 09:56:47.000000000 +02:00
tags:
- AWS
- Data Lake
- Data Engineering
---
# How To Efficiently Extract Tables From MSSQL Server To A Data Lake.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2023-08-02-How-to-Efficiently-Extract-Tables-from-MSSQL-Server-to-a-Data-Lake.png" | absolute_url }})
{: refdef}

5 Min Read

---

# The Story

In this step-by-step guide, I'll walk you through the process I followed when extracting tables from MicroSoft SQL Server, prioritizing the extraction based on data volume, concurrent connections, and more, and then efficiently storing the data on our Enterprise Data Lake running on AWS.

## The How

### Step 1: Analyze the Current Extraction Process

Start by reviewing the existing data extraction process to understand its limitations and bottlenecks. By Identifying bottlenecks to understand where improvements are needed and paying attention to tables with high data volume and long extraction times. The image below shows an extraction run that timed out after 5 hours due to various bottlenecks:

* Concurrent connections set to 2
* No-Parallel data transfer configurations
* Chronological table extraction instead of extracting large & small tables concurrently
* Daily Full-Extractions instead of incremental extractions (HWM)

![2023-08-02_12-09]({{ "/assets/2023-08-02_12-09.png" | absolute_url }})

### Step 2: Analyze Data Volume and Frequency

The first step was to identify the tables that need to be extracted and evaluate their data volume. Prioritize the extraction of large tables with higher data volume, as these may require more time for processing and should be addressed first. The SQL script below will provide a clear overview of the table's size and record count.

```sql
USE SEMANTIC;

SELECT
	t.TABLE_CATALOG + '.' + sche.name + '.' + tbl.name AS FullTableName,
	SUM(PART.rows) AS TableRecordCount,
	CAST(ROUND(((au.data_pages) * 8) / 1024.00 / 1024.00, 2) AS NUMERIC(36, 2)) AS TotalSpaceGB
FROM
	sys.tables AS tbl
	INNER JOIN INFORMATION_SCHEMA.TABLES AS t
		ON t.TABLE_NAME = tbl.name
	INNER JOIN sys.partitions AS PART
		ON tbl.object_id = PART.object_id
	INNER JOIN sys.indexes AS IDX
		ON PART.object_id = IDX.object_id
		AND PART.index_id = IDX.index_id
	INNER JOIN sys.schemas AS sche
		ON sche.schema_id = tbl.schema_id
	INNER JOIN sys.allocation_units AS au
		ON PART.partition_id = au.container_id
WHERE
	IDX.index_id < 2
	AND patindex('%[0-9]%', tbl.name) = 0
	AND patindex('%tmp%', tbl.name) = 0
	AND patindex('%dev%', tbl.name) = 0
GROUP BY
	t.TABLE_CATALOG + '.' + sche.[name] + '.' + tbl.[name],
	CAST(ROUND(((au.data_pages) * 8) / 1024.00 / 1024.00, 2) AS NUMERIC(36, 2))
ORDER BY
	CAST(ROUND(((au.data_pages) * 8) / 1024.00 / 1024.00, 2) AS NUMERIC(36, 2)) DESC;
```

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/f48edf86-8995-4b54-b119-359dc0b0b868)


### Step 2: Consider Data Dependency
Another avenue, was to check for any dependencies between tables and determine the correct order for extraction to maintain data integrity. Some tables may rely on data from others, and extracting them out of order could lead to data inconsistencies. By identifying Foreign key relations, analyzing views, stored procedures and functions.

### Step 3: Evaluate Concurrent Connections
It's essential to assess the number of concurrent connections available for extraction. Based on this evaluation, optimize the extraction process to make the most efficient use of concurrent connections.

#### On SQL Server
Evaluate if the server supports JDBC concurrent connections, you can check the maximum number of concurrent connections allowed by the SQL server using the query below, where `0` means there is no limit on the number of connections.


```sql
SELECT value AS MaxUserConnections
FROM sys.configurations
WHERE name = 'user connections';
```

You can also evaluate if the servers MaxDOP (Maximum Degree of Parallelism) is configured - setting that controls the maximum number of processors used to execute a single query in parallel. Not this may or may not directly impact JDBC concurrent extractions, as it depends on workloads and query complexities and patterns. But worth evaluating, note that by default MSSQL’s MaxDOP is set to 0 - allowing the db engine to use all available processors. Using the SQL code below, you can confirm if it is set.

```sql
EXEC sp_configure 'max degree of parallelism';
```

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/4b0cb113-e69c-4266-8fe8-1520a0968806)

Keep in mind that the number of concurrent connections a server can handle depends on various factors, including hardware resources, memory, CPU, and the workload on the server. It's essential to monitor the server's performance, potential query blocking after MaxDOP changes and adjust the maximum connections accordingly to avoid resource contention and performance issues.

#### On AWS Glue
Current JDBC concurrent connections initially set to 10 (for testing purposes),

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/cd64838e-7da7-41cf-b690-986c477d2c0a)

resulting in the image shown below.  An analysis on the table extraction and duration is detailed on [How to Visualize EDL2.0's Step Functions Data]()

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/d558b1c1-5df7-40f6-a415-9ce26d7a8a5a)

### Step 4: Utilize AWS Glue for Parallel Processing

Leverage the power of AWS Glue's Extract, Transform, Load (ETL) capabilities to parallelize reads and significantly speed up the extraction process. By using multiple AWS Glue worker nodes, you can achieve efficient parallel processing for faster data extraction.

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/723e662d-4c6e-46d2-a8ee-5820aea110f4)


### Step 5: Implement Data Security Measures
Identify tables that contain sensitive or regulated data and implement appropriate security measures to protect this information during the extraction and migration process.

### Step 6: Plan for Data Growth
Anticipate future data growth over the next 1-5 years to accommodate scalability needs. Prioritize the extraction of tables that have significant growth potential, ensuring your data lake can handle future expansions.