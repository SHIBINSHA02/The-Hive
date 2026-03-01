/*Stores conditional business logic rules for the contract template.

Defines rules such as:

if a certain field is selected, require another field

if optional clause is enabled, enforce extra placeholders

if dispute resolution = arbitration, require arbitration location

enforce consistency between placeholders and clauses

Used mainly for:

advanced validation before generation

smart UI behavior (show/hide fields)

preventing invalid contract combinations*/