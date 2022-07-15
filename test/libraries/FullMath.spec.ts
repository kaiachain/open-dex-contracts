import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';
import { FullMathTest } from '../../typechain/mocks/FullMathTest';

describe('FullMath', () => {
  let fm: FullMathTest;
  before('deploy FullMathTest', async () => {
    const fmFactoty = await ethers.getContractFactory('FullMathTest');
    fm = await fmFactoty.deploy();
  });

  describe('#mulDiv', () => {
    const Q128 = BigNumber.from(2).pow(128);
    it('accurate without phantom overflow', async () => {
      const result = Q128.div(3);
      expect(
        await fm.mulDiv(
          Q128,
          /* 0.5= */ BigNumber.from(50).mul(Q128).div(100),
          /* 1.5= */ BigNumber.from(150).mul(Q128).div(100),
        ),
      ).to.eq(result);

      expect(
        await fm.mulDivRoundingUp(
          Q128,
          /* 0.5= */ BigNumber.from(50).mul(Q128).div(100),
          /* 1.5= */ BigNumber.from(150).mul(Q128).div(100),
        ),
      ).to.eq(result.add(1));
    });

    it('accurate with phantom overflow', async () => {
      const result = BigNumber.from(4375).mul(Q128).div(1000);
      expect(await fm.mulDiv(
        Q128,
        BigNumber.from(35).mul(Q128),
        BigNumber.from(8).mul(Q128),
      )).to.eq(result);
      expect(await fm.mulDivRoundingUp(
        Q128,
        BigNumber.from(35).mul(Q128),
        BigNumber.from(8).mul(Q128),
      )).to.eq(result);
    });

    it('accurate with phantom overflow and repeating decimal', async () => {
      const result = BigNumber.from(1).mul(Q128).div(3);
      expect(await fm.mulDiv(
        Q128,
        BigNumber.from(1000).mul(Q128),
        BigNumber.from(3000).mul(Q128),
      )).to.eq(result);
      expect(await fm.mulDivRoundingUp(
        Q128,
        BigNumber.from(1000).mul(Q128),
        BigNumber.from(3000).mul(Q128),
      )).to.eq(
        result.add(1),
      );
    });
  });
});
