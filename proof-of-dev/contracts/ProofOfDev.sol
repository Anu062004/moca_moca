// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProofOfDev
 * @dev Soulbound Token (SBT) representing developer reputation
 * @notice This token is non-transferable and represents a developer's GitHub reputation
 */
contract ProofOfDev is ERC721, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Struct to store developer reputation data
    struct DeveloperProfile {
        string githubUsername;
        uint256 reputationScore;
        uint256 totalCommits;
        uint256 totalRepositories;
        uint256 totalStars;
        uint256 followers;
        uint256 accountAge;
        string[] topLanguages;
        uint256 mintedAt;
        bool isActive;
    }
    
    // Mapping from token ID to developer profile
    mapping(uint256 => DeveloperProfile) public developerProfiles;
    
    // Mapping from wallet address to token ID
    mapping(address => uint256) public walletToTokenId;
    
    // Mapping from GitHub username to token ID
    mapping(string => uint256) public githubToTokenId;
    
    // Events
    event DeveloperProfileMinted(
        address indexed developer,
        uint256 indexed tokenId,
        string githubUsername,
        uint256 reputationScore
    );
    
    event DeveloperProfileUpdated(
        uint256 indexed tokenId,
        uint256 newReputationScore
    );
    
    constructor() ERC721("Proof of Dev", "POD") Ownable() {}
    
    /**
     * @dev Mint a new Proof of Dev SBT
     * @param developer The wallet address of the developer
     * @param profile The developer's profile data
     */
    function mintDeveloperProfile(
        address developer,
        DeveloperProfile memory profile
    ) external onlyOwner {
        require(developer != address(0), "Invalid developer address");
        require(walletToTokenId[developer] == 0, "Developer already has a profile");
        require(githubToTokenId[profile.githubUsername] == 0, "GitHub username already registered");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        profile.mintedAt = block.timestamp;
        profile.isActive = true;
        
        developerProfiles[tokenId] = profile;
        walletToTokenId[developer] = tokenId;
        githubToTokenId[profile.githubUsername] = tokenId;
        
        _safeMint(developer, tokenId);
        
        emit DeveloperProfileMinted(
            developer,
            tokenId,
            profile.githubUsername,
            profile.reputationScore
        );
    }
    
    /**
     * @dev Update developer reputation score
     * @param tokenId The token ID to update
     * @param newScore The new reputation score
     */
    function updateReputationScore(uint256 tokenId, uint256 newScore) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        require(developerProfiles[tokenId].isActive, "Profile is not active");
        
        developerProfiles[tokenId].reputationScore = newScore;
        
        emit DeveloperProfileUpdated(tokenId, newScore);
    }
    
    /**
     * @dev Get developer profile by wallet address
     * @param developer The wallet address
     * @return profile The developer profile
     */
    function getProfileByWallet(address developer) external view returns (DeveloperProfile memory profile) {
        uint256 tokenId = walletToTokenId[developer];
        require(tokenId != 0, "No profile found for this wallet");
        return developerProfiles[tokenId];
    }
    
    /**
     * @dev Get developer profile by GitHub username
     * @param githubUsername The GitHub username
     * @return profile The developer profile
     */
    function getProfileByGitHub(string memory githubUsername) external view returns (DeveloperProfile memory profile) {
        uint256 tokenId = githubToTokenId[githubUsername];
        require(tokenId != 0, "No profile found for this GitHub username");
        return developerProfiles[tokenId];
    }
    
    /**
     * @dev Check if a wallet has a Proof of Dev profile
     * @param developer The wallet address
     * @return hasProfile True if the wallet has a profile
     */
    function hasProfile(address developer) external view returns (bool hasProfile) {
        return walletToTokenId[developer] != 0;
    }
    
    /**
     * @dev Override transfer functions to make token non-transferable (Soulbound)
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0) || to == address(0), "Token is non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override approve functions to prevent transfers
     */
    function approve(address to, uint256 tokenId) public override {
        revert("Token is non-transferable");
    }
    
    function setApprovalForAll(address operator, bool approved) public override {
        revert("Token is non-transferable");
    }
    
    /**
     * @dev Get total number of minted tokens
     * @return total The total number of tokens
     */
    function totalSupply() external view returns (uint256 total) {
        return _tokenIdCounter.current();
    }
}
