Thank you for your interest in contributing to NanoZK! We greatly appreciate contributions from all. Below is important information to get you started. If you need additional help, feel free to ask us on our [Discord server](https://discord.com/invite/nanozk).

## Quick Start

[TBD]

## Project Overview

This project is a monorepo of packages with well-defined purposes. All of the following are packages are located in the [packages/\*](https://github.com/hyperspaceinc/nanozk/blob/master/packages) directory.

### `@nanozk/core`

This is the backbone of the NanoZK project. It houses the main functionalities, algorithms, and computations related to Zero-Knowledge Proofs. The core is responsible for tasks such as generating proofs, verifying proofs, and handling cryptographic operations.

### `@nanozk/sdk-ts`

The typescript SDK is the user-facing interface for integrating and working with NanoZK. It provides high-level APIs that allow users to interact with NanoZK's core functionalities in a simple and user-friendly way. The SDK is designed to make it easy for developers to work with Zero-Knowledge Proofs, abstracting away the complexities involved.

### `@nanozk/networking`

The networking package is responsible for handling all network-related functionalities in NanoZK. It includes components for peer-to-peer communication, data transfer, network security, and synchronization. This package enables NanoZK to connect multiple devices and work collaboratively in a distributed manner.

### `@nanozk/adapters`

The adapters package contains modules that allow NanoZK to interface with other software or hardware components. This includes, but not limited to, storage adapters (for different database systems), communication adapters (for various network protocols), and computational adapters (for various hardware architectures). These adapters provide flexibility and make NanoZK more versatile by allowing it to integrate with a wide range of systems.

## Next Steps

To learn more about how NanoZK works, visit our development guide:

https://nanozk.com/docs

For relatively simple tasks to familiarize yourself with `NanoZK`, please check out issues labeled with the `good-first-issue` label [here](https://github.com/hyperspaceinc/nanozk/labels/good-first-issue). If you find an interesting unassigned issue, or one not actively worked on in some time, ask for it to be assigned to you and someone from the team will help you get started.

If you have an idea for an enhancement to the protocol itself, please make a proposal by following the [NanoZK Enhancement Proposal](https://github.com/hyperspaceinc/nanozk/blob/master/neps/nep-001.md) process.

## Pull Requests

Contributions to `NanoZK` happen via Pull Requests. Follow these steps when creating a PR:

1. Fork the `NanoZK` repository and create a new branch for your work.
2. The branch can contain any number of commits. All commits will be squashed into a single commit when merged.
3. Your changes should be thoroughly tested. Refer to [this document](https://github.com/hyperspaceinc/nanozk/blob/master/docs/testing/README.md) for our testing guidelines.
4. Your changes should be linted and follow the linting guidelines.
5. When ready, send a pull request against the `master` branch of the `NanoZK` repository.
6. Feel free to submit draft PRs to get early feedback and ensure you're on the right track.
7. The PR name should follow the template: `<type>: <name>`, where `type` is:
   - `fix` for bug fixes;
   - `feat` for new features;
   - `refactor` for code reorganization;
   - `doc` for changes to documentation or comments;
   - `test` for new tests;
   - `chore` for tasks like updating dependencies.
8. The PR should contain a description to provide additional information to the reviewer.
9. If your PR introduces a user-observable change, document it in [CHANGELOG.md](CHANGELOG.md) in the `[unreleased]` section.

## After the PR is submitted

1. We have a CI process configured to run various tests on each PR. All tests need to pass before a PR can be merged.
2. Once all comments from the reviewers have been addressed, they should approve the PR. This allows it to be merged.
3. An approved PR can be merged by adding the `automerge` label to it. The author or a reviewer can add this label.

## Code review process

When a PR is created, a reviewer will be automatically assigned. They may choose to review the PR themselves or delegate to another team member. Expect multiple rounds of reviews to ensure high-quality contributions. Use GitHub's "Request Review" feature to solicit additional reviews if necessary.

You can also directly request reviews from specific persons [through the GitHub UI](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review).

## Release Schedule

Once your change ends up in master, it will be released with the rest of the changes by other contributors on the regular release schedules.
