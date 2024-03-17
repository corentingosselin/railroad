const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);


    const PrivilegeCard = await ethers.getContractFactory("PrivilegeCard");
    const privilegeCard = await PrivilegeCard.deploy(deployer.address);

    console.log("PrivilegeCard address:", privilegeCard.target);

    const configPath = path.join(__dirname, '../railroad-front/src/assets/contractAddress.json');
    fs.writeFileSync(configPath, JSON.stringify({ address: privilegeCard.target }, undefined, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });