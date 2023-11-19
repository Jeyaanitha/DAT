const awsController = require("../controller/awsController")
const router=require("express").Router();

router.post("/vpc",awsController.aws_vpc)
router.post("/login",awsController.aws_login)
router.get("/vpclist",awsController.vpc_list);
router.post("/ec2_instance",awsController.ec2_instance) 
router.get("/SG_list",awsController.security_group_list)
router.get("/subnet_list",awsController.subnet_list)

module.exports=router