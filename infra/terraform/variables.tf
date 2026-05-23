variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "mountainconnect"
}

variable "environment" {
  description = "Deployment environment (production, staging, development)"
  type        = string
  default     = "staging"
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.r6g.large"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "mountainconnect.id"
}

variable "allowed_ips" {
  description = "List of CIDR blocks allowed for admin access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "ecs_task_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 1024
}

variable "ecs_task_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 2048
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}
