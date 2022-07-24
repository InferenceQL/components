{ pkgs ? import (fetchTarball https://github.com/nixos/nixpkgs/tarball/nixpkgs-unstable) {} }:

with pkgs;

mkShell {
  buildInputs = with pkgs; [
    nodejs-18_x
    pkgs.nodePackages.pnpm
  ];
}
