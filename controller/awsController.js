
const fs = require('fs');
const { exec } = require('child_process');


//AWS LOGIN
async function aws_login(req, res) {
  try {
    if (`${req.body.username}` === "demo" && `${req.body.password}` === "demo@123") {
      const tfConfig = `
            provider "aws" {
                access_key = "AKIA2TVEYKFLUYXXLOEV"
                secret_key = "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"
                region     = "ap-south-1"
              }`;

      // Write the Terraform configuration to a file
      fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/main.tf', tfConfig);

      // Define the relative path to the Terraform configuration directory
      const configPath = '/home/jeya/Music/Self_Service_Portal';

      // Change the current working directory to the Terraform configuration directory
      process.chdir(configPath);

      //  Run Terraform commands
      exec('terraform init', (error, initStdout, initStderr) => {
        if (error) {
          console.error('Terraform initialization failed:', initStderr);
          res.status(400).send("Terraform initialization failed");
        } else {
          console.log('Terraform initialization succeeded.');
          exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
              console.error('Terraform apply failed:', applyStderr);
              res.status(400).send("Terraform apply failed");
            } else {
              console.log('Terraform apply succeeded.');
              res.status(200).send("Login Successfully.");
            }
          });
        }
      });
    }
    else {
      res.status(404).send("Invalid user name and password")
    }
  }
  catch (error) {
    console.log("error is : ", error)
    res.status(400).send("An error occurred in AWS LOGIN");
  }
}

// TO CREATE VPC
async function aws_vpc(req, res) {
  try {
    const tfConfig = `
        // vpc
        resource "aws_vpc" "demo_vpc" {
            cidr_block       = "10.0.0.0/16"
            instance_tenancy = "default"
            tags = {
              Name = "demo_vpc"
            }
          }
          
          // 2 public create subnet - 1a
          resource "aws_subnet" "demo_pub_subnet" {
            vpc_id     = aws_vpc.demo_vpc.id
            cidr_block = "10.0.1.0/24"
            availability_zone = "ap-south-1a"
            map_public_ip_on_launch = true
            tags = {
              Name = "demo_pub_subnet"
            }
          }
  
          //3 private subnet - 1a
          resource "aws_subnet" "demo_pvt_subnet" {
             vpc_id     = aws_vpc.demo_vpc.id
             cidr_block = "10.0.2.0/24"
             availability_zone = "ap-south-1a"
             tags = {
             Name = "demo_pvt_subnet"
            }
          }
          
          //4 public create subnet - 1b
          resource "aws_subnet" "demo_pub_subnet_1b" {
            vpc_id     = aws_vpc.demo_vpc.id
            cidr_block = "10.0.3.0/24"
            availability_zone = "ap-south-1b"
            map_public_ip_on_launch = true
            tags = {
              Name = "demo_pub_subnet_1b"
            }
          }
  
          // private subnet - 1b
          resource "aws_subnet" "demo_pvt_subnet_1b" {
             vpc_id     = aws_vpc.demo_vpc.id
             cidr_block = "10.0.4.0/24"
             availability_zone = "ap-south-1b"
             tags = {
             Name = "demo_pvt_subnet_1b"
            }
          }

          //3 create internet gateway
          resource "aws_internet_gateway" "demo_igw" {
          vpc_id = aws_vpc.demo_vpc.id
            tags = {
              Name = "demo_igw"
            }
          }
           
          //4 public route table
          resource "aws_route_table" "demo_pub_rt" {
          vpc_id = aws_vpc.demo_vpc.id
            route {
              cidr_block = "0.0.0.0/0"
              gateway_id = aws_internet_gateway.demo_igw.id
            }
            tags = {
              Name = "demo_pub_rt"
            }
          }
          
          //5 associate public subnet with route table
          resource "aws_route_table_association" "demo_pub_sn_asso" {
            subnet_id      = aws_subnet.demo_pub_subnet.id 
            route_table_id = aws_route_table.demo_pub_rt.id
          }
           
          //6 associate public subnet 1b with route table
          resource "aws_route_table_association" "demo_pub_sn_asso_1b" {
            subnet_id      = aws_subnet.demo_pub_subnet_1b.id 
            route_table_id = aws_route_table.demo_pub_rt.id
          }
          
          
          //7 route table for private
          resource "aws_route_table" "demo_pvt_rt" {
            vpc_id = aws_vpc.demo_vpc.id
            tags = {
              Name = "demo_pvt_rt"
            }
          }
           
          //8 associate private subnet 1b with route table
          resource "aws_route_table_association" "demo_pvt_sn_asso" {
            subnet_id      = aws_subnet.demo_pvt_subnet.id
            route_table_id = aws_route_table.demo_pvt_rt.id
          }
          
          //9 associate private subnet 1b with route table
          resource "aws_route_table_association" "demo_pvt_sn_asso_1b" {
            subnet_id      = aws_subnet.demo_pvt_subnet_1b.id
            route_table_id = aws_route_table.demo_pvt_rt.id
          }

          // public security group
          resource "aws_security_group" "demo_sg_pub" {
            name        = "demo_sg_pub"
            description = "Allow TLS inbound traffic"
            vpc_id      = aws_vpc.demo_vpc.id
          
          //type ssh,rdp,http
            ingress {
              description      = "TLS from VPC"
              from_port        = 22
              to_port          = 22
              protocol         = "tcp" 
              cidr_blocks      = ["0.0.0.0/0"]  
              ipv6_cidr_blocks = ["::/0"]
            }
              ingress {
              description      = "TLS from VPC"
              from_port        = 443
              to_port          = 443
              protocol         = "tcp" 
              cidr_blocks      = ["0.0.0.0/0"] 
              ipv6_cidr_blocks = ["::/0"]
            }
              ingress {
              description      = "TLS from VPC"
              from_port        = 80
              to_port          = 80
              protocol         = "tcp" 
              cidr_blocks      = ["0.0.0.0/0"] 
              ipv6_cidr_blocks = ["::/0"]
            }
          
            egress {
              from_port        = 0
              to_port          = 0
              protocol         = "-1"
              cidr_blocks      = ["0.0.0.0/0"]
              ipv6_cidr_blocks = ["::/0"]
            }
          
            tags = {
              Name = "demo_sg_pub"
            }
          }

          
          // private security group
          resource "aws_security_group" "demo_sg_pvt" {
            name        = "demo_sg_pvt"
            description = "Allow TLS inbound traffic"
            vpc_id      = aws_vpc.demo_vpc.id
          
            ingress {
              description      = "TLS from VPC"
              from_port        = 0
              to_port          = 65535
              protocol         = "tcp" 
              cidr_blocks      = ["10.0.1.0/24"]  
              ipv6_cidr_blocks = ["::/0"]
            }     
            egress {
              from_port        = 0
              to_port          = 0
              protocol         = "-1"
              cidr_blocks      = ["0.0.0.0/0"]
              ipv6_cidr_blocks = ["::/0"]
            }
          
            tags = {
              Name = "demo_sg_pvt"
            }
          } 
          `;

    const output = `output "vpcs" {
      value = {
        v = {
          id   = aws_vpc.demo_vpc.id
          tags = aws_vpc.demo_vpc.tags
        }
      
        pub_subnet = {
          id   = aws_subnet.demo_pub_subnet.id
          tags = aws_subnet.demo_pub_subnet.tags
        }
      
        pvt_subnet = {
          id   = aws_subnet.demo_pvt_subnet.id
          tags = aws_subnet.demo_pvt_subnet.tags
        }
      
        pub_subnet_1b = {
          id   = aws_subnet.demo_pub_subnet_1b.id
          tags = aws_subnet.demo_pub_subnet_1b.tags
        }
      
        pvt_subnet_1b = {
          id   = aws_subnet.demo_pvt_subnet_1b.id
          tags = aws_subnet.demo_pvt_subnet_1b.tags
        }
      
        internet_gateway = {
          id   = aws_internet_gateway.demo_igw.id
          tags = aws_internet_gateway.demo_igw.tags
        }
      
        pub_route_table = {
          id   = aws_route_table.demo_pub_rt.id
          tags = aws_route_table.demo_pub_rt.tags
        }
      
        pvt_route_table = {
          id   = aws_route_table.demo_pvt_rt.id
          tags = aws_route_table.demo_pvt_rt.tags
        }
      
        pub_sg = {
          id   = aws_security_group.demo_sg_pub.id
          tags = aws_security_group.demo_sg_pub.tags
        }
      
        pvt_sg = {
          id   = aws_security_group.demo_sg_pvt.id
          tags = aws_security_group.demo_sg_pvt.tags
        }
      }
    }`;

    // Write the Terraform configuration to a file
    fs.writeFileSync('/home/jeya/Music/Self_Service_Portal/vpc.tf', tfConfig);
    fs.writeFileSync('/home/jeya/Music/Self_Service_Portal/vpc_output.tf', output);

    // Define the relative path to the Terraform configuration directory
    const configPath = '/home/jeya/Music/Self_Service_Portal';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);
    exec('terraform apply -auto-approve -parallelism=10', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform apply failed:', applyStderr);
        return res.status(400).send("Terraform apply failed");
      }else{
      console.error('Terraform success:', applyStdout);
      const resourceIds = [];
      // Regular expression pattern to extract resource information
      const resourcePattern = /"id"\s*=\s*"([^"]+)"/g;
      let match;
      while ((match = resourcePattern.exec(applyStdout)) !== null) {
      const resourceId = match[1];

      // Log extracted values
      console.log('Resource ID:', resourceId);

      // Store the resource ID
      resourceIds.push(resourceId);
}

console.log('Resource IDs:', resourceIds);
res.status(200).json({ message: 'VPC created successfully', resourceIds });
} 
});     
} catch (error) {
    console.log('error is:', error);
    res.status(400).send('An error occurred (VPC)');
  }
}

async function vpc_list(req, res) {
  try {
    const tfConfig = `data "aws_vpcs" "foo" {
          }
          output "foo" {
            value = data.aws_vpcs.foo.ids
          }`;

    // Write the Terraform configuration to a file
    fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/vpc_list.tf', tfConfig);

    // Define the relative path to the Terraform configuration directory
    const configPath = '/home/jeya/Music/Self_Service_Portal';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);

    // Run Terraform commands

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform apply failed:', applyStderr);
        res.send("Terraform apply failed");
      } else {
        console.log('Terraform apply succeeded.');
        console.log(applyStdout);
        const vpcIdRegex = /"vpc-\w+"/g;
        const matchArray = applyStdout.match(vpcIdRegex);
        const vpcIds = matchArray.map(match => match.replace(/"/g, ''));
        res.status(200).json({ message: 'VPC list', vpcIds });
      }
    });
  } catch (error) {
    console.log("error is:", error);
    res.status(400).send("An error occurred(VPC)");
  }
};


async function ec2_instance(req, res) {
  try {
    const tfConfig = `
        data "aws_ami" "${req.body.os_name}" {
            most_recent = true
          
            filter {
              name   = "name"
              values = ["${req.body.os_value}"]
            }
            
            filter {
              name   = "virtualization-type"
              values = ["hvm"]
            }
          
          }
          resource "aws_instance" "demo_${req.body.os_name}"{
              ami = data.aws_ami.${req.body.os_name}.id
              instance_type = "${req.body.instance_type}"
              associate_public_ip_address = true
              subnet_id = "${req.body.subnet_id}"
              vpc_security_group_ids = ["${req.body.vpc_security_group_ids}"]
              tags = {
              Name = "demo_${req.body.os_name}_1"
            }
      }
      `;

      const ec2_output = `output "EC2_instance_info" {
        value = {
          ec2_instance = {
            id   = aws_instance.demo_${req.body.os_name}.id
            tags = aws_instance.demo_${req.body.os_name}.tags
          }
        }
      }` 
    // Write the Terraform configuration to a file
    fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/ec2_instance.tf', tfConfig);
    fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/ec2_output.tf', ec2_output);

    // Define the relative path to the Terraform configuration directory
    const configPath = '/home/jeya/Music/Self_Service_Portal';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);

    // Run Terraform commands
    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform apply failed:', applyStderr);
        res.status(400).send("Terraform apply failed");
      } else {
        console.log('Terraform apply succeeded.');
    
        try {
          const vpcIds = [];
          const ec2Ids = [];
    
          // Regular expression pattern to extract VPC ID
          const vpcPattern = /"v"\s*=\s*{\s*"id"\s*=\s*"([^"]+)"/g;
          let vpcMatch;
          while ((vpcMatch = vpcPattern.exec(applyStdout)) !== null) {
            const vpcId = vpcMatch[1];
            console.log('VPC ID:', vpcId);
            vpcIds.push(vpcId);
          }
    
          // Regular expression pattern to extract EC2 instance ID
          const ec2Pattern = /"ec2_instance"\s*=\s*{\s*"id"\s*=\s*"([^"]+)"/g;
          let ec2Match;
          while ((ec2Match = ec2Pattern.exec(applyStdout)) !== null) {
            const ec2Id = ec2Match[1];
            console.log('EC2 Instance ID:', ec2Id);
            ec2Ids.push(ec2Id);
          }
    
          // console.log('VPC IDs:', vpcIds);
          // console.log('EC2 Instance IDs:', ec2Ids);
    
          res.status(200).json({
            message: 'EC2 instance created successfully',
            resourceIds: [...vpcIds, ...ec2Ids,`${req.body.subnet_id}`,`${req.body.vpc_security_group_ids}`],
          });
        } catch (jsonError) {
          console.error('Error parsing JSON output:', jsonError);
          res.status(500).send('Internal Server Error');
        }
      }
    });   
  }
  catch (error) {
    console.log("error is : ", error)
    res.send("An error occurred (EC2 INSTANCE)");
  }
}

async function security_group_list(req, res) {
  try {
    const tfConfig = `
          data "aws_security_groups" "dys-sg" {
          }
          output "dys-sg" {
             value = data.aws_security_groups.dys-sg.ids
          }`;

    fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/security_group_list.tf', tfConfig);

    // Define the relative path to the Terraform configuration directory
    const configPath = '/home/jeya/Music/Self_Service_Portal';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);

    exec('terraform init', (error, initStdout, initStderr) => {
      if (error) {
        console.error('Terraform initialization failed:', initStderr);
        res.send("Terraform initialization failed");
      } else {
        console.log('Terraform initialization succeeded.');
        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
          if (applyError) {
            console.error('Terraform apply failed:', applyStderr);
            res.send("Terraform apply failed");
          } else {
            console.log('Terraform apply succeeded.');
            console.log(applyStdout);
            const securityGroupIdRegex = /"sg-\w+"/g;
            const matchArray = applyStdout.match(securityGroupIdRegex);
            const securityGroupIds = matchArray.map(match => match.replace(/"/g, ''));
            res.status(200).json({ message: 'Security Group IDs:', securityGroupIds });

          }
        });
      }
    });
  } catch (error) {
    console.log("error is : ", error);
    res.send("An error occurred in (Security Group)");
  }
}
async function subnet_list(req, res) {
  try {
    const tfConfig = `data "aws_subnet" "sn" {
          }
          
          output "sn" {
            value = data.aws_subnet.sn.id
          }`;
    // Write the Terraform configuration to a file
    fs.appendFileSync('/home/jeya/Music/Self_Service_Portal/subnet_list.tf', tfConfig);

    // Define the relative path to the Terraform configuration directory
    const configPath = '/home/jeya/Music/Self_Service_Portal';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);

    // Run Terraform commands

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform apply failed:', applyStderr);
        res.send("Terraform apply failed");
      } else {
        console.log('Terraform apply succeeded.');
        console.log(applyStdout);
        const subnetIdRegex = /"subnet-\w+"/g;
        const matchArray = applyStdout.match(subnetIdRegex);
        const subnetIds = matchArray.map(match => match.replace(/"/g, ''));
        res.status(200).json({ message: 'Subnet IDs:', subnetIds });
      }
    });

  } catch (error) {
    const response = {
      error: error.message,
    };
    res.status(500).json(response); 
  }
};

module.exports = {
  aws_login,
  aws_vpc,
  vpc_list,
  ec2_instance,
  security_group_list,
  subnet_list
};
