terraform {
  backend "s3" {
    bucket = "multiple-game-deploy-bucket-1"
    key    = "ecs-state-file/terraform.tfstate"
    region = "ap-south-1"
  }
}