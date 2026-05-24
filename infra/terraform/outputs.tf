output "load_balancer_url" {
  description = "Load balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "api_url" {
  description = "API endpoint URL"
  value       = "https://api.${var.domain_name}"
}

output "dashboard_url" {
  description = "Dashboard URL"
  value       = "https://dashboard.${var.domain_name}"
}

output "rds_endpoint" {
  description = "RDS endpoint address"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "redis_endpoint" {
  description = "ElastiCache Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "redis_reader_endpoint" {
  description = "ElastiCache Redis reader endpoint"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "asset_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = aws_s3_bucket.assets.id
}
