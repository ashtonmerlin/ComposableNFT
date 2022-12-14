import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const {deployments, getNamedAccounts} = hre;
	const {deploy} = deployments;
	
	const {deployer} = await getNamedAccounts();

	const name = "ERC721Item";
	const symbol = "ERC721Item";

	await deploy('ERC721Item', {
		from: deployer,
		gasLimit: 5000000,
		gasPrice: "5000000000",
		args: [name, symbol],
		log: true,
		autoMine: true // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});
};
export default func;
func.tags = ['ERC721Item'];

