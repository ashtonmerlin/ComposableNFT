import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	
	const {deployer} = await getNamedAccounts();

	await deploy('ERC1155Item', {
		from: deployer,
		gasLimit: 5000000,
		args: [],
		log: true,
		autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
};
export default func;
func.tags = ['ERC1155Item'];

